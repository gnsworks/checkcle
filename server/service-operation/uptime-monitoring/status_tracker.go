
package uptimemonitoring

import (
	"sync"
	"time"
)

// ServiceStatusTracker tracks service status changes and notification timing
type ServiceStatusTracker struct {
	lastStatus           map[string]string
	lastNotificationTime map[string]time.Time
	mu                   sync.RWMutex
}

// NewServiceStatusTracker creates a new service status tracker
func NewServiceStatusTracker() *ServiceStatusTracker {
	return &ServiceStatusTracker{
		lastStatus:           make(map[string]string),
		lastNotificationTime: make(map[string]time.Time),
	}
}

// GetLastStatus returns the last known status for a service
func (sst *ServiceStatusTracker) GetLastStatus(serviceID string) string {
	sst.mu.RLock()
	defer sst.mu.RUnlock()
	status := sst.lastStatus[serviceID]
	// log.Printf("🔍 GetLastStatus for %s: %s", serviceID, status)
	return status
}

// UpdateStatus updates the last known status for a service
func (sst *ServiceStatusTracker) UpdateStatus(serviceID, status string) {
	sst.mu.Lock()
	defer sst.mu.Unlock()
	
	oldStatus := sst.lastStatus[serviceID]
	sst.lastStatus[serviceID] = status
	
	// log.Printf("📝 UpdateStatus for %s: %s -> %s", serviceID, oldStatus, status)
	_ = oldStatus
}

// GetLastNotificationTime returns the last time a notification was sent for a service
func (sst *ServiceStatusTracker) GetLastNotificationTime(serviceID string) time.Time {
	sst.mu.RLock()
	defer sst.mu.RUnlock()
	lastTime := sst.lastNotificationTime[serviceID]
	// log.Printf("⏰ GetLastNotificationTime for %s: %v", serviceID, lastTime)
	return lastTime
}

// SetLastNotificationTime sets the last notification time for a service
func (sst *ServiceStatusTracker) SetLastNotificationTime(serviceID string, t time.Time) {
	sst.mu.Lock()
	defer sst.mu.Unlock()
	sst.lastNotificationTime[serviceID] = t
	// log.Printf("⏰ SetLastNotificationTime for %s: %v", serviceID, t)
}

// ShouldNotify determines if a notification should be sent (legacy method for compatibility)
func (sst *ServiceStatusTracker) ShouldNotify(serviceID, currentStatus string) bool {
	sst.mu.RLock()
	lastStatus := sst.lastStatus[serviceID]
	sst.mu.RUnlock()
	
	shouldNotify := lastStatus == "" || lastStatus != currentStatus
	// log.Printf("🤔 ShouldNotify for %s: lastStatus='%s', currentStatus='%s', result=%t", serviceID, lastStatus, currentStatus, shouldNotify)
	
	// Send notification if status changed or if it's the first check
	return shouldNotify
}