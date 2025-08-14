
package uptimemonitoring

import (
	"time"

	"service-operation/pocketbase"
)

// UptimeMonitor monitors uptime services and sends notifications
type UptimeMonitor struct {
	client              *UptimeClient
	notificationService *UptimeNotificationService
	checkInterval       time.Duration
	stopChan            chan bool
}

// NewUptimeMonitor creates a new uptime monitor
func NewUptimeMonitor(pbClient *pocketbase.PocketBaseClient) *UptimeMonitor {
	// Initialize uptime client
	uptimeClient := NewUptimeClient(pbClient)
	
	// Initialize notification service
	notificationService := NewUptimeNotificationService(uptimeClient, pbClient)

	// Set check interval to 30 seconds to match server monitoring
	checkInterval := 30 * time.Second

	return &UptimeMonitor{
		client:              uptimeClient,
		notificationService: notificationService,
		checkInterval:       checkInterval,
		stopChan:            make(chan bool, 1),
	}
}

// Start begins monitoring uptime services
func (um *UptimeMonitor) Start() {
	// log.Printf("🚀 [UPTIME-MONITOR] Starting with check interval: %v", um.checkInterval)
	// log.Printf("⏰ [UPTIME-MONITOR] Startup grace period: 2 minutes (no notifications for UP services)")

	// Run initial check
	um.checkServices()

	// Set up periodic checking every 30 seconds
	ticker := time.NewTicker(um.checkInterval)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			um.checkServices()
		case <-um.stopChan:
			// log.Println("🛑 [UPTIME-MONITOR] Monitoring stopped")
			return
		}
	}
}

// Stop gracefully stops the uptime monitoring
func (um *UptimeMonitor) Stop() {
	// log.Printf("🛑 [UPTIME-MONITOR] Stopping uptime monitoring...")
	select {
	case um.stopChan <- true:
	default:
	}
}

// checkServices fetches all services and checks their notification requirements
func (um *UptimeMonitor) checkServices() {
	// log.Printf("🔍 [UPTIME-CHECK] Checking uptime services for status changes...")

	services, err := um.client.GetServices()
	if err != nil {
		// log.Printf("❌ [UPTIME-ERROR] Failed to fetch services: %v", err)
		_ = err
		return
	}

	// log.Printf("📊 [UPTIME-SERVICES] Found %d services to check", len(services))

	successCount := 0
	errorCount := 0

	for _, service := range services {
		// Skip paused services
		if service.Status == "paused" {
			// log.Printf("⏸️ [UPTIME-SKIP] Service %s is paused - skipping", service.Name)
			continue
		}

		// Check each service for notification requirements
		if err := um.notificationService.CheckAndNotifyService(service); err != nil {
			// log.Printf("❌ [UPTIME-FAILED] Failed to process service %s: %v", service.Name, err)
			_ = err
			errorCount++
		} else {
			successCount++
		}
	}

	// log.Printf("✅ [UPTIME-SUMMARY] Processed %d services (success: %d, errors: %d)", 
	//	len(services), successCount, errorCount)
	_ = successCount
	_ = errorCount
}