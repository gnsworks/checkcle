
package sslmonitoring

import (
	"sync"
	"time"

	"service-operation/pocketbase"
)

// SSLStatusTracker tracks SSL certificate status changes and notification timing using database persistence
type SSLStatusTracker struct {
	pbClient *pocketbase.PocketBaseClient
	mu       sync.RWMutex
}

// NewSSLStatusTracker creates a new SSL status tracker with database persistence
func NewSSLStatusTracker(pbClient *pocketbase.PocketBaseClient) *SSLStatusTracker {
	return &SSLStatusTracker{
		pbClient: pbClient,
	}
}

// GetLastStatus returns the last known status for an SSL certificate from database
func (sst *SSLStatusTracker) GetLastStatus(certID string) string {
	sst.mu.RLock()
	defer sst.mu.RUnlock()
	
	cert, err := sst.pbClient.GetSSLCertificateByID(certID)
	if err != nil {
		// log.Printf("🔍 [SSL-TRACKER] Error getting last status for %s: %v", certID, err)
		return ""
	}
	
	status := cert.Status
	// log.Printf("🔍 [SSL-TRACKER] GetLastStatus for %s: %s", certID, status)
	return status
}

// UpdateStatus updates the last known status for an SSL certificate in database
func (sst *SSLStatusTracker) UpdateStatus(certID, status string) {
	sst.mu.Lock()
	defer sst.mu.Unlock()
	
	// Get current certificate to preserve other fields
	cert, err := sst.pbClient.GetSSLCertificateByID(certID)
	if err != nil {
		// log.Printf("📝 [SSL-TRACKER] Error getting certificate for status update %s: %v", certID, err)
		return
	}
	
	oldStatus := cert.Status
	
	// Update only the status field
	updateData := map[string]interface{}{
		"status": status,
	}
	
	err = sst.pbClient.UpdateSSLCertificate(certID, updateData)
	if err != nil {
		// log.Printf("📝 [SSL-TRACKER] Error updating status for %s: %v", certID, err)
		return
	}
	
	// log.Printf("📝 [SSL-TRACKER] UpdateStatus for %s: %s -> %s", certID, oldStatus, status)
	_ = oldStatus // Prevent unused variable warning
}

// GetLastNotificationTime returns the last time a notification was sent for an SSL certificate from database
func (sst *SSLStatusTracker) GetLastNotificationTime(certID string) time.Time {
	sst.mu.RLock()
	defer sst.mu.RUnlock()
	
	cert, err := sst.pbClient.GetSSLCertificateByID(certID)
	if err != nil {
		// log.Printf("⏰ [SSL-TRACKER] Error getting last notification time for %s: %v", certID, err)
		return time.Time{}
	}
	
	if cert.LastNotified == "" {
		// log.Printf("⏰ [SSL-TRACKER] GetLastNotificationTime for %s: never notified", certID)
		return time.Time{}
	}
	
	lastTime, err := time.Parse(time.RFC3339, cert.LastNotified)
	if err != nil {
		// log.Printf("⏰ [SSL-TRACKER] Error parsing last notification time for %s: %v", certID, err)
		return time.Time{}
	}
	
	// log.Printf("⏰ [SSL-TRACKER] GetLastNotificationTime for %s: %v", certID, lastTime)
	return lastTime
}

// SetLastNotificationTime sets the last notification time for an SSL certificate in database
func (sst *SSLStatusTracker) SetLastNotificationTime(certID string, t time.Time) {
	sst.mu.Lock()
	defer sst.mu.Unlock()
	
	updateData := map[string]interface{}{
		"last_notified": t.Format(time.RFC3339),
	}
	
	err := sst.pbClient.UpdateSSLCertificate(certID, updateData)
	if err != nil {
		// log.Printf("⏰ [SSL-TRACKER] Error setting last notification time for %s: %v", certID, err)
		return
	}
	
	// log.Printf("⏰ [SSL-TRACKER] SetLastNotificationTime for %s: %v", certID, t)
}