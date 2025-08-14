
package servermonitoring

import (
	"time"

	"service-operation/notification"
	"service-operation/pocketbase"
)

// ServerNotificationService handles server-specific notifications
type ServerNotificationService struct {
	notificationManager *notification.NotificationManager
}

// NewServerNotificationService creates a new server notification service
func NewServerNotificationService(pbClient *pocketbase.PocketBaseClient) *ServerNotificationService {
	// log.Println("🔧 Creating new ServerNotificationService instance")
	return &ServerNotificationService{
		notificationManager: notification.NewNotificationManager(pbClient),
	}
}

// SendResourceNotification sends a resource-specific notification (CPU, RAM, Disk, etc.)
func (sns *ServerNotificationService) SendResourceNotification(server Server, status string, message string, resourceType string) error {
	return sns.SendResourceNotificationWithValues(server, status, message, resourceType, "N/A", "N/A")
}

// SendResourceNotificationWithValues sends a resource-specific notification with actual usage and threshold values
func (sns *ServerNotificationService) SendResourceNotificationWithValues(server Server, status string, message string, resourceType string, usageValue string, thresholdValue string) error {
	// log.Printf("📨 === SENDING RESOURCE NOTIFICATION WITH VALUES ===")
	// log.Printf("🔔 SendResourceNotificationWithValues called for server: %s", server.Name)
	// log.Printf("📊 Resource Notification Parameters:")
	// log.Printf("  - Server Name: %s", server.Name)
	// log.Printf("  - Resource Type: %s", resourceType)
	// log.Printf("  - Status: %s", status)
	// log.Printf("  - Message: %s", message)
	// log.Printf("  - Usage Value: %s", usageValue)
	// log.Printf("  - Threshold Value: %s", thresholdValue)
	// log.Printf("  - Notification ID: '%s'", server.NotificationID)
	// log.Printf("  - Template ID: '%s'", server.TemplateID)
	
	// Validate notification configuration
	if server.NotificationID == "" {
		// log.Printf("❌ NOTIFICATION FAILED: No notification ID configured for server %s", server.Name)
		return nil
	}

	// Get server metrics for notification
	cpuUsage, ramUsage, diskUsage, networkUsage, cpuTemp, diskIO := sns.getServerMetrics(server.ServerID)

	// Override specific resource metric with actual value
	switch resourceType {
	case "cpu":
		cpuUsage = usageValue
	case "ram", "memory":
		ramUsage = usageValue
	case "disk":
		diskUsage = usageValue
	case "network":
		networkUsage = usageValue
	case "cpu_temp", "cpu_temperature":
		cpuTemp = usageValue
	case "disk_io":
		diskIO = usageValue
	}

	// Convert to generic notification payload
	notificationPayload := &notification.NotificationPayload{
		ServiceName:  server.Name,
		Status:       status,
		Host:         server.IPAddress,
		Hostname:     server.Hostname,
		Port:         0,
		ServiceType:  "server",
		ResponseTime: 0,
		Timestamp:    time.Now(),
		Message:      message,
		// Server monitoring metrics
		CPUUsage:     cpuUsage,
		RAMUsage:     ramUsage,
		DiskUsage:    diskUsage,
		NetworkUsage: networkUsage,
		CPUTemp:      cpuTemp,
		DiskIO:       diskIO,
		Threshold:    thresholdValue,
	}

	// log.Printf("📤 About to call SendResourceNotification...")
	// log.Printf("  - Resource Type: %s", resourceType)
	// log.Printf("  - Notification ID: %s", server.NotificationID)
	// log.Printf("  - Template ID: %s", server.TemplateID)
	// log.Printf("  - Usage Value: %s", usageValue)
	// log.Printf("  - Threshold Value: %s", thresholdValue)

	// Send resource-specific notification using the notification manager
	err := sns.notificationManager.SendResourceNotification(notificationPayload, server.NotificationID, server.TemplateID, resourceType)
	if err != nil {
		// log.Printf("❌ RESOURCE NOTIFICATION ERROR for server %s: %v", server.Name, err)
		return err
	}

	// log.Printf("✅ RESOURCE NOTIFICATION SENT SUCCESSFULLY for server %s (%s)", server.Name, resourceType)
	// log.Printf("=== RESOURCE NOTIFICATION COMPLETE ===")
	
	return nil
}

// SendServerNotification sends a notification for server status change
func (sns *ServerNotificationService) SendServerNotification(server Server, status string, message string) error {
	// log.Printf("📨 === SENDING SERVER NOTIFICATION ===")
	// log.Printf("🔔 SendServerNotification called for server: %s", server.Name)
	// log.Printf("📊 Notification Parameters:")
	// log.Printf("  - Server Name: %s", server.Name)
	// log.Printf("  - Server ID: %s", server.ServerID)
	// log.Printf("  - Status: %s", status)
	// log.Printf("  - Message: %s", message)
	// log.Printf("  - Notification ID: '%s'", server.NotificationID)
	// log.Printf("  - Template ID: '%s'", server.TemplateID)
	// log.Printf("  - IP Address: %s", server.IPAddress)
	// log.Printf("  - Hostname: %s", server.Hostname)
	
	// Validate notification configuration
	if server.NotificationID == "" {
		// log.Printf("❌ NOTIFICATION FAILED: No notification ID configured for server %s", server.Name)
		return nil
	}

	// log.Printf("✅ Notification ID validation passed: %s", server.NotificationID)

	// Get server metrics for notification
	cpuUsage, ramUsage, diskUsage, networkUsage, cpuTemp, diskIO := sns.getServerMetrics(server.ServerID)

	// Convert to generic notification payload
	// log.Printf("🔄 Converting to generic notification payload...")
	notificationPayload := &notification.NotificationPayload{
		ServiceName:  server.Name,
		Status:       status,
		Host:         server.IPAddress,
		Hostname:     server.Hostname,
		Port:         0, // Servers don't have ports
		ServiceType:  "server",
		ResponseTime: 0,
		Timestamp:    time.Now(),
		Message:      message,
		// Server monitoring metrics
		CPUUsage:     cpuUsage,
		RAMUsage:     ramUsage,
		DiskUsage:    diskUsage,
		NetworkUsage: networkUsage,
		CPUTemp:      cpuTemp,
		DiskIO:       diskIO,
		Threshold:    "N/A", // Can be set based on server configuration
	}

	// log.Printf("📦 Generic notification payload created:")
	// log.Printf("  - ServiceName: %s", notificationPayload.ServiceName)
	// log.Printf("  - Status: %s", notificationPayload.Status)
	// log.Printf("  - Host: %s", notificationPayload.Host)
	// log.Printf("  - ServiceType: %s", notificationPayload.ServiceType)
	// log.Printf("  - Message: %s", notificationPayload.Message)
	// log.Printf("  - CPUUsage: %s", notificationPayload.CPUUsage)
	// log.Printf("  - RAMUsage: %s", notificationPayload.RAMUsage)
	// log.Printf("  - DiskUsage: %s", notificationPayload.DiskUsage)
	// log.Printf("  - NetworkUsage: %s", notificationPayload.NetworkUsage)
	// log.Printf("  - CPUTemp: %s", notificationPayload.CPUTemp)
	// log.Printf("  - DiskIO: %s", notificationPayload.DiskIO)
	// log.Printf("  - Timestamp: %v", notificationPayload.Timestamp)

	// log.Printf("📤 About to call SendServiceNotification...")
	// log.Printf("  - Notification ID: %s", server.NotificationID)
	// log.Printf("  - Template ID: %s", server.TemplateID)

	// Send notification using the notification manager
	err := sns.notificationManager.SendServiceNotification(notificationPayload, server.NotificationID, server.TemplateID)
	if err != nil {
		// log.Printf("❌ NOTIFICATION MANAGER ERROR for server %s: %v", server.Name, err)
		// log.Printf("❌ Error Details:")
		// log.Printf("  - Error Type: %T", err)
		// log.Printf("  - Error Message: %s", err.Error())
		// log.Printf("  - Notification ID used: %s", server.NotificationID)
		// log.Printf("  - Template ID used: %s", server.TemplateID)
		return err
	}

	// log.Printf("✅ NOTIFICATION SENT SUCCESSFULLY for server %s", server.Name)
	// log.Printf("✅ Notification Details:")
	// log.Printf("  - Status: %s", status)
	// log.Printf("  - Notification ID: %s", server.NotificationID)
	// log.Printf("  - Template ID: %s", server.TemplateID)
	// log.Printf("=== NOTIFICATION COMPLETE ===")
	
	return nil
}

// getServerMetrics retrieves the latest server metrics (placeholder implementation)
// This should be replaced with actual metric retrieval from your monitoring system
func (sns *ServerNotificationService) getServerMetrics(serverID string) (cpuUsage, ramUsage, diskUsage, networkUsage, cpuTemp, diskIO string) {
	// TODO: Implement actual metric retrieval from your server monitoring system
	// For now, returning placeholder values
	// You should replace this with actual calls to your metrics collection system
	
	// log.Printf("🔍 Retrieving server metrics for server ID: %s", serverID)
	
	// These should be replaced with actual metric values from your monitoring system
	cpuUsage = "N/A"
	ramUsage = "N/A" 
	diskUsage = "N/A"
	networkUsage = "N/A"
	cpuTemp = "N/A"
	diskIO = "N/A"
	
	// Example of how you might retrieve metrics:
	// You could query your metrics database, call an API, or read from system files
	// For example:
	// metrics, err := sns.getLatestMetrics(serverID)
	// if err == nil {
	//     cpuUsage = fmt.Sprintf("%.1f%%", metrics.CPUUsage)
	//     ramUsage = fmt.Sprintf("%.1f%%", metrics.RAMUsage)
	//     diskUsage = fmt.Sprintf("%.1f%%", metrics.DiskUsage)
	//     networkUsage = fmt.Sprintf("%.2f MB/s", metrics.NetworkUsage)
	//     cpuTemp = fmt.Sprintf("%.1f°C", metrics.CPUTemp)
	//     diskIO = fmt.Sprintf("%.2f MB/s", metrics.DiskIO)
	// }
	
	// log.Printf("📊 Retrieved server metrics:")
	// log.Printf("  - CPU Usage: %s", cpuUsage)
	// log.Printf("  - RAM Usage: %s", ramUsage)
	// log.Printf("  - Disk Usage: %s", diskUsage)
	// log.Printf("  - Network Usage: %s", networkUsage)
	// log.Printf("  - CPU Temperature: %s", cpuTemp)
	// log.Printf("  - Disk I/O: %s", diskIO)
	
	_ = serverID
	return cpuUsage, ramUsage, diskUsage, networkUsage, cpuTemp, diskIO
}