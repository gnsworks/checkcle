package monitoring

import (
	"log"

	"service-operation/notification"
	"service-operation/pocketbase"
)

// NotificationMonitor handles notification logic for the monitoring service
type NotificationMonitor struct {
	notifier     *notification.ServiceNotifier
	lastStatuses map[string]string // Track last known status for each service
}

// NewNotificationMonitor creates a new notification monitor
func NewNotificationMonitor(pbClient *pocketbase.PocketBaseClient) *NotificationMonitor {
	return &NotificationMonitor{
		notifier:     notification.NewServiceNotifier(pbClient),
		lastStatuses: make(map[string]string),
	}
}

// CheckAndNotify checks if notification should be sent and sends it
func (nm *NotificationMonitor) CheckAndNotify(service pocketbase.Service, currentStatus string) {
	// Skip if no notification configured
	if service.NotificationID == "" {
		return
	}

	// Get last known status
	lastStatus, exists := nm.lastStatuses[service.ID]
	
	// Send notification if:
	// 1. This is the first check (no previous status)
	// 2. Status has changed
	// 3. Service is currently down (always notify for down status)
	shouldNotify := !exists || lastStatus != currentStatus || currentStatus == "down"

	if shouldNotify {
		log.Printf("Sending notification for service %s: %s -> %s", service.Name, lastStatus, currentStatus)
		
		// Send notification using custom method
		if err := nm.notifier.NotifyCustom(
			service.NotificationID,
			service.TemplateID,
			service.Name,
			currentStatus,
			nm.formatStatusMessage(service, currentStatus),
		); err != nil {
			log.Printf("Failed to send notification: %v", err)
		}
	}

	// Update last known status
	nm.lastStatuses[service.ID] = currentStatus
}

// formatStatusMessage creates a formatted message for the status change
func (nm *NotificationMonitor) formatStatusMessage(service pocketbase.Service, status string) string {
	switch status {
	case "up":
		return "Service is now operational"
	case "down":
		return "Service is currently unavailable"
	case "warning":
		return "Service is experiencing issues"
	default:
		return "Service status has changed"
	}
}