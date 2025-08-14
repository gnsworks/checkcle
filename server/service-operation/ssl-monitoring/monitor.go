
package sslmonitoring

import (
	"time"

	"service-operation/pocketbase"
)

// SSLMonitor monitors SSL certificates and sends notifications
type SSLMonitor struct {
	client              *SSLClient
	notificationService *SSLNotificationService
	checkInterval       time.Duration
	stopChan            chan bool
}

// NewSSLMonitor creates a new SSL monitor
func NewSSLMonitor(pbClient *pocketbase.PocketBaseClient) *SSLMonitor {
	// Initialize SSL client
	sslClient := NewSSLClient(pbClient)
	
	// Initialize notification service
	notificationService := NewSSLNotificationService(sslClient, pbClient)

	// Set check interval to 30 seconds to match other services
	checkInterval := 30 * time.Second

	return &SSLMonitor{
		client:              sslClient,
		notificationService: notificationService,
		checkInterval:       checkInterval,
		stopChan:            make(chan bool, 1),
	}
}

// Start begins monitoring SSL certificates
func (sm *SSLMonitor) Start() {
	// log.Printf("🚀 [SSL-MONITOR] Starting with check interval: %v", sm.checkInterval)
	// log.Printf("⏰ [SSL-MONITOR] Startup grace period: 2 minutes (no notifications for valid certificates)")

	// Run initial check
	sm.checkCertificates()

	// Set up periodic checking every 30 seconds
	ticker := time.NewTicker(sm.checkInterval)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			sm.checkCertificates()
		case <-sm.stopChan:
			// log.Println("🛑 [SSL-MONITOR] Monitoring stopped")
			return
		}
	}
}

// Stop gracefully stops the SSL monitoring
func (sm *SSLMonitor) Stop() {
	// log.Printf("🛑 [SSL-MONITOR] Stopping SSL monitoring...")
	select {
	case sm.stopChan <- true:
	default:
	}
}

// checkCertificates fetches all SSL certificates and checks their notification requirements
func (sm *SSLMonitor) checkCertificates() {
	// log.Printf("🔍 [SSL-CHECK] Checking SSL certificates for expiration alerts...")

	certificates, err := sm.client.GetSSLCertificates()
	if err != nil {
		// log.Printf("❌ [SSL-ERROR] Failed to fetch SSL certificates: %v", err)
		return
	}

	// log.Printf("📊 [SSL-CERTIFICATES] Found %d certificates to check", len(certificates))

	successCount := 0
	errorCount := 0

	for _, cert := range certificates {
		// Check each certificate for notification requirements
		if err := sm.notificationService.CheckAndNotifySSLCertificate(cert); err != nil {
			// log.Printf("❌ [SSL-FAILED] Failed to process certificate %s: %v", cert.Domain, err)
			errorCount++
		} else {
			successCount++
		}
	}

	// log.Printf("✅ [SSL-SUMMARY] Processed %d certificates (success: %d, errors: %d)", 
	//	len(certificates), successCount, errorCount)
	_ = successCount // Prevent unused variable warning
	_ = errorCount   // Prevent unused variable warning
}