
package uptimemonitoring

import (
	"fmt"
	"strings"
	"time"

	"service-operation/notification"
	"service-operation/pocketbase"
)

// UptimeNotificationService handles notifications for uptime services
type UptimeNotificationService struct {
	client          *UptimeClient
	notificationMgr *notification.NotificationManager
	statusTracker   *ServiceStatusTracker
	startupTime     time.Time
	gracePeriod     time.Duration
}

// NewUptimeNotificationService creates a new uptime notification service
func NewUptimeNotificationService(client *UptimeClient, pbClient *pocketbase.PocketBaseClient) *UptimeNotificationService {
	return &UptimeNotificationService{
		client:          client,
		notificationMgr: notification.NewNotificationManager(pbClient),
		statusTracker:   NewServiceStatusTracker(),
		startupTime:     time.Now(),
		gracePeriod:     2 * time.Minute, // 2 minute grace period after startup
	}
}

// isInGracePeriod checks if we're still in the startup grace period
func (uns *UptimeNotificationService) isInGracePeriod() bool {
	return time.Since(uns.startupTime) < uns.gracePeriod
}

// CheckAndNotifyService checks a service and sends notifications for status changes
func (uns *UptimeNotificationService) CheckAndNotifyService(service UptimeService) error {
	// log.Printf("🔍 [UPTIME-CHECK] Checking service: %s (ID: %s, Type: %s)", service.Name, service.ID, service.ServiceType)

	// Check if notifications are enabled for this service
	if !uns.isNotificationEnabled(service) {
		// log.Printf("⚠️ [SKIP] Notifications disabled for service %s", service.Name)
		return nil
	}

	// Get ACTUAL current status from PocketBase metrics (including error message)
	actualCurrentStatus, responseTime, errorMessage, err := uns.getActualServiceStatusWithError(service)
	if err != nil {
		// log.Printf("❌ [ERROR] Failed to get actual status for %s: %v", service.Name, err)
		// If we can't get status, assume it's down
		actualCurrentStatus = "down"
		responseTime = 0
		errorMessage = fmt.Sprintf("Failed to retrieve service metrics: %v", err)
	}

	// Get previously tracked status
	previousStatus := uns.statusTracker.GetLastStatus(service.ID)
	
	// log.Printf("📊 [STATUS-COMPARE] Service %s: PREVIOUS='%s' -> ACTUAL_CURRENT='%s', Error: '%s'", service.Name, previousStatus, actualCurrentStatus, errorMessage)

	// Initialize tracking for new services
	if previousStatus == "" {
		// log.Printf("🆕 [INIT] First time tracking service %s - setting initial status: %s", service.Name, actualCurrentStatus)
		
		// Check if we're in startup grace period
		if uns.isInGracePeriod() {
			// log.Printf("⏰ [GRACE-PERIOD] Service %s - within startup grace period, skipping initial notification", service.Name)
			uns.statusTracker.UpdateStatus(service.ID, actualCurrentStatus)
			return nil
		}
		
		// Only send initial notification if service is DOWN (critical status)
		if actualCurrentStatus == "down" {
			// log.Printf("🚨 [CRITICAL-INIT] Service %s is DOWN on first check - sending notification", service.Name)
			err := uns.sendImmediateNotification(service, actualCurrentStatus, responseTime, errorMessage, "INITIAL_DOWN_DETECTED")
			if err != nil {
				// log.Printf("❌ [FAILED] Initial DOWN notification failed for %s: %v", service.Name, err)
				_ = err
			} else {
				// log.Printf("✅ [SUCCESS] Initial DOWN notification sent for %s", service.Name)
				uns.statusTracker.SetLastNotificationTime(service.ID, time.Now())
			}
		} else {
			// log.Printf("ℹ️ [INIT-SKIP] Service %s is %s on first check - skipping notification (not critical)", service.Name, actualCurrentStatus)
		}
		
		uns.statusTracker.UpdateStatus(service.ID, actualCurrentStatus)
		return nil
	}

	// Check if there's a REAL status change
	if previousStatus != actualCurrentStatus {
		// log.Printf("🚨 [REAL-CHANGE] STATUS CHANGE for %s: %s -> %s", service.Name, previousStatus, actualCurrentStatus)
		
		// Send notification immediately for real status change
		err := uns.sendImmediateNotification(service, actualCurrentStatus, responseTime, errorMessage, fmt.Sprintf("STATUS_CHANGE_%s_TO_%s", previousStatus, actualCurrentStatus))
		if err != nil {
			// log.Printf("❌ [FAILED] Status change notification failed for %s: %v", service.Name, err)
			return err
		}

		// log.Printf("✅ [SUCCESS] Status change notification sent for %s", service.Name)
		uns.statusTracker.SetLastNotificationTime(service.ID, time.Now())
		uns.statusTracker.UpdateStatus(service.ID, actualCurrentStatus)
		
	} else if actualCurrentStatus == "down" {
		// For services that remain down, send periodic notifications (every 5 minutes)
		lastNotified := uns.statusTracker.GetLastNotificationTime(service.ID)
		if time.Since(lastNotified) >= 5*time.Minute {
			// log.Printf("⏰ [PERIODIC] Service %s still down for 5+ minutes - sending reminder", service.Name)
			
			err := uns.sendImmediateNotification(service, actualCurrentStatus, responseTime, errorMessage, "PERIODIC_DOWN_REMINDER")
			if err != nil {
				// log.Printf("❌ [FAILED] Periodic down notification failed for %s: %v", service.Name, err)
				return err
			}

			// log.Printf("✅ [SUCCESS] Periodic down notification sent for %s", service.Name)
			uns.statusTracker.SetLastNotificationTime(service.ID, time.Now())
		}
	} else {
		// log.Printf("ℹ️ [NO-CHANGE] No status change for %s (both %s) - no notification needed", service.Name, actualCurrentStatus)
	}

	return nil
}

// getActualServiceStatusWithError gets the real current status from PocketBase metrics including error message
func (uns *UptimeNotificationService) getActualServiceStatusWithError(service UptimeService) (string, int64, string, error) {
	// Get the appropriate collection based on service type
	collection := uns.getCollectionForServiceType(service.ServiceType)
	
	// log.Printf("🔍 [METRICS-CHECK] Getting actual status for %s from collection: %s", service.Name, collection)
	
	// Get the latest metric record for this service
	records, err := uns.client.GetLatestMetricRecord(service.ID, collection)
	if err != nil {
		// log.Printf("❌ [METRICS-ERROR] Failed to get metrics for %s: %v", service.Name, err)
		return "unknown", 0, fmt.Sprintf("Failed to retrieve metrics: %v", err), err
	}

	if len(records) == 0 {
		// log.Printf("⚠️ [NO-METRICS] No metrics found for service %s", service.Name)
		return "down", 0, "No metrics data available", fmt.Errorf("no metrics found for service %s", service.Name)
	}

	// Get the latest record
	latestRecord := records[0]
	actualStatus := latestRecord.Status
	responseTime := int64(latestRecord.ResponseTime)
	errorMessage := latestRecord.ErrorMessage // Get the error message from the record
	
	// log.Printf("📈 [METRICS-RESULT] Latest metric for %s: Status=%s, ResponseTime=%dms, Error='%s', Timestamp=%s", 
	//	service.Name, actualStatus, responseTime, errorMessage, latestRecord.Timestamp)

	return actualStatus, responseTime, errorMessage, nil
}

// getCollectionForServiceType maps service types to their corresponding collections
func (uns *UptimeNotificationService) getCollectionForServiceType(serviceType string) string {
	switch strings.ToLower(serviceType) {
	case "ping", "icmp":
		return "ping_data"
	case "dns":
		return "dns_data"
	case "tcp":
		return "tcp_data"
	case "http", "https":
		return "uptime_data"
	default:
		return "uptime_data"
	}
}

// sendImmediateNotification sends notification with zero delay for status changes
func (uns *UptimeNotificationService) sendImmediateNotification(service UptimeService, status string, responseTime int64, errorMessage, reason string) error {
	// log.Printf("⚡ [IMMEDIATE-SEND] Sending notification for %s (status: %s, error: '%s', reason: %s)", service.Name, status, errorMessage, reason)

	// Build notification payload with actual current status and error message
	payload := &notification.NotificationPayload{
		ServiceName:  service.Name,
		Status:       status,
		Host:         service.Host,
		Port:         service.Port,
		ServiceType:  service.ServiceType,
		ResponseTime: responseTime,
		ErrorMessage: errorMessage, // Include the error message from metrics
		Timestamp:    time.Now(),
		Message:      uns.generateMessage(service, status, reason),
	}

	// Add optional fields
	if service.Domain != "" {
		payload.Domain = service.Domain
	}
	if service.URL != "" {
		payload.URL = service.URL
	}
	if service.RegionName != "" {
		payload.RegionName = service.RegionName
	}
	if service.AgentID != "" {
		payload.AgentID = service.AgentID
	}
	payload.Uptime = service.Uptime

	// log.Printf("⚡ [TELEGRAM-SEND] Sending uptime notification for %s via NotificationManager with error: '%s'", service.Name, errorMessage)

	// Send notification using the uptime manager
	return uns.notificationMgr.SendUptimeServiceNotification(payload, service.NotificationID, service.TemplateID)
}

// generateMessage creates a status message for notifications
func (uns *UptimeNotificationService) generateMessage(service UptimeService, status, reason string) string {
	statusEmoji := "✅"
	action := "is operational"

	switch strings.ToLower(status) {
	case "down":
		statusEmoji = "❌"
		action = "is DOWN"
	case "warning":
		statusEmoji = "⚠️"
		action = "has issues"
	case "up":
		statusEmoji = "✅"
		previousStatus := uns.statusTracker.GetLastStatus(service.ID)
		if previousStatus == "down" {
			action = "has RECOVERED"
			statusEmoji = "🔄"
		} else {
			action = "is operational"
		}
	}

	message := fmt.Sprintf("%s [UPTIME] %s %s", statusEmoji, service.Name, action)

	if service.Host != "" {
		message += fmt.Sprintf(" | Host: %s", service.Host)
	}

	// Add reason for debugging (only in logs, not in user message)
	// log.Printf("📝 [MSG-DEBUG] Generated uptime message for %s: %s [%s]", service.Name, message, reason)

	return message
}

// isNotificationEnabled checks if notifications should be sent
func (uns *UptimeNotificationService) isNotificationEnabled(service UptimeService) bool {
	// Check notification_status boolean field
	if !service.NotificationStatus {
		// log.Printf("📵 Service %s notification_status: false", service.Name)
		return false
	}

	// Check alerts field for muted status
	if service.Alerts == "muted" {
		// log.Printf("🔇 Service %s alerts muted", service.Name)
		return false
	}

	// Check if notification_id is configured
	if service.NotificationID == "" {
		// log.Printf("📵 Service %s has no notification_id", service.Name)
		return false
	}

	// log.Printf("✅ Service %s notifications enabled (ID: %s)", service.Name, service.NotificationID)
	return true
}