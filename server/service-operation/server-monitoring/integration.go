
package servermonitoring

import (
	"service-operation/pocketbase"
)

// ServerMonitoringService provides an easy interface for server monitoring
type ServerMonitoringService struct {
	monitor *ServerMonitor
}

// NewServerMonitoringService creates a new server monitoring service
func NewServerMonitoringService(pbClient *pocketbase.PocketBaseClient) *ServerMonitoringService {
	return &ServerMonitoringService{
		monitor: NewServerMonitor(pbClient),
	}
}

// Start starts the server monitoring service
func (sms *ServerMonitoringService) Start() {
	sms.monitor.Start()
}

// Stop stops the server monitoring service
func (sms *ServerMonitoringService) Stop() {
	sms.monitor.Stop()
}

// GetMonitor returns the underlying monitor for advanced usage
func (sms *ServerMonitoringService) GetMonitor() *ServerMonitor {
	return sms.monitor
}

// IsRunning returns whether the monitoring service is currently running
func (sms *ServerMonitoringService) IsRunning() bool {
	sms.monitor.mu.RLock()
	defer sms.monitor.mu.RUnlock()
	return sms.monitor.isRunning
}