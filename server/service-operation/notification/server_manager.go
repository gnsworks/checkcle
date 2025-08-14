
package notification

import (
	"fmt"
	"strings"

	"service-operation/pocketbase"
)

// ServerNotificationManager handles server-specific notifications
type ServerNotificationManager struct {
	pbClient *pocketbase.PocketBaseClient
	services map[string]NotificationService
}

// NewServerNotificationManager creates a new server notification manager
func NewServerNotificationManager(pbClient *pocketbase.PocketBaseClient, services map[string]NotificationService) *ServerNotificationManager {
	return &ServerNotificationManager{
		pbClient: pbClient,
		services: services,
	}
}

// SendServiceNotification sends notification for a service based on its configuration
func (snm *ServerNotificationManager) SendServiceNotification(payload *NotificationPayload, notificationID, templateID string) error {
	// log.Printf("📨 SendServiceNotification called with notification_id: %s, template_id: %s", notificationID, templateID)
	// log.Printf("📨 Payload: %+v", payload)
	
	if notificationID == "" {
		// log.Printf("❌ Notification ID is required but was empty")
		return fmt.Errorf("notification ID is required")
	}

	// Parse multiple notification IDs
	notificationIDs := parseNotificationIDs(notificationID)
	if len(notificationIDs) == 0 {
		// log.Printf("❌ No valid notification IDs found")
		return fmt.Errorf("no valid notification IDs found")
	}

	var errors []string
	successCount := 0

	// Send notification to each channel
	for _, id := range notificationIDs {
		// log.Printf("📤 Processing notification ID: %s", id)
		
		// Check if notification is enabled
		if !isNotificationEnabled(snm.pbClient, id) {
			// log.Printf("⚠️  Notification %s is disabled, skipping", id)
			continue
		}

		// Get alert configuration
		alertConfig, err := getAlertConfiguration(snm.pbClient, id)
		if err != nil {
			// log.Printf("❌ Failed to get alert configuration for %s: %v", id, err)
			errors = append(errors, fmt.Sprintf("failed to get config for %s: %v", id, err))
			continue
		}

		// Get template if provided
		var template *ServerNotificationTemplate
		if templateID != "" {
			template, err = getNotificationTemplate(snm.pbClient, templateID)
			if err != nil {
				// log.Printf("⚠️  Warning: failed to get template %s for notification %s: %v", templateID, id, err)
			}
		}

		// Generate message from template or use default
		message := snm.generateMessage(payload, template)
		// log.Printf("📝 Generated message for %s: %s", id, message)

		// Send notification using appropriate service
		service, exists := snm.services[alertConfig.NotificationType]
		if !exists {
			// log.Printf("❌ Unsupported notification type for %s: %s", id, alertConfig.NotificationType)
			errors = append(errors, fmt.Sprintf("unsupported notification type for %s: %s", id, alertConfig.NotificationType))
			continue
		}

		err = service.SendNotification(alertConfig, message)
		if err != nil {
			// log.Printf("❌ Failed to send notification via %s for %s: %v", alertConfig.NotificationType, id, err)
			errors = append(errors, fmt.Sprintf("failed to send via %s for %s: %v", alertConfig.NotificationType, id, err))
		} else {
			// log.Printf("✅ Successfully sent notification via %s for %s", alertConfig.NotificationType, id)
			successCount++
		}
	}

	// Report results
	if successCount > 0 {
		// log.Printf("✅ Successfully sent %d out of %d notifications", successCount, len(notificationIDs))
	}

	if len(errors) > 0 {
		// log.Printf("❌ Errors occurred: %v", errors)
		if successCount == 0 {
			return fmt.Errorf("all notifications failed: %v", errors)
		}
		// If some succeeded, just log errors but don't return error
		// log.Printf("⚠️  Some notifications failed but %d succeeded", successCount)
	}

	return nil
}

// SendResourceNotification sends notification for specific resource alerts (CPU, RAM, Disk, etc.)
func (snm *ServerNotificationManager) SendResourceNotification(payload *NotificationPayload, notificationID, templateID, resourceType string) error {
	// log.Printf("📨 SendResourceNotification called for resource: %s", resourceType)
	// log.Printf("📨 Notification ID: %s, Template ID: %s", notificationID, templateID)
	// log.Printf("📨 Payload: %+v", payload)
	
	if notificationID == "" {
		// log.Printf("❌ Notification ID is required but was empty")
		return fmt.Errorf("notification ID is required")
	}

	// Parse multiple notification IDs
	notificationIDs := parseNotificationIDs(notificationID)
	if len(notificationIDs) == 0 {
		// log.Printf("❌ No valid notification IDs found")
		return fmt.Errorf("no valid notification IDs found")
	}

	var errors []string
	successCount := 0

	// Send notification to each channel
	for _, id := range notificationIDs {
		// log.Printf("📤 Processing resource notification ID: %s", id)
		
		// Check if notification is enabled
		if !isNotificationEnabled(snm.pbClient, id) {
			// log.Printf("⚠️  Notification %s is disabled, skipping", id)
			continue
		}

		// Get alert configuration
		alertConfig, err := getAlertConfiguration(snm.pbClient, id)
		if err != nil {
			// log.Printf("❌ Failed to get alert configuration for %s: %v", id, err)
			errors = append(errors, fmt.Sprintf("failed to get config for %s: %v", id, err))
			continue
		}

		// Get template if provided
		var template *ServerNotificationTemplate
		if templateID != "" {
			template, err = getNotificationTemplate(snm.pbClient, templateID)
			if err != nil {
				// log.Printf("⚠️  Warning: failed to get template %s for notification %s: %v", templateID, id, err)
			}
		}

		// Generate resource-specific message
		message := snm.generateResourceMessage(payload, template, resourceType)
		// log.Printf("📝 Generated resource message for %s: %s", id, message)

		// Send notification
		service, exists := snm.services[alertConfig.NotificationType]
		if !exists {
			// log.Printf("❌ Unsupported notification type for %s: %s", id, alertConfig.NotificationType)
			errors = append(errors, fmt.Sprintf("unsupported notification type for %s: %s", id, alertConfig.NotificationType))
			continue
		}

		err = service.SendNotification(alertConfig, message)
		if err != nil {
			// log.Printf("❌ Failed to send resource notification via %s for %s: %v", alertConfig.NotificationType, id, err)
			errors = append(errors, fmt.Sprintf("failed to send via %s for %s: %v", alertConfig.NotificationType, id, err))
		} else {
			// log.Printf("✅ Successfully sent resource notification via %s for %s", alertConfig.NotificationType, id)
			successCount++
		}
	}

	// Report results
	if successCount > 0 {
		// log.Printf("✅ Successfully sent %d out of %d resource notifications", successCount, len(notificationIDs))
	}

	if len(errors) > 0 {
		// log.Printf("❌ Resource notification errors occurred: %v", errors)
		if successCount == 0 {
			return fmt.Errorf("all resource notifications failed: %v", errors)
		}
		// If some succeeded, just log errors but don't return error
		// log.Printf("⚠️  Some resource notifications failed but %d succeeded", successCount)
	}

	return nil
}

// generateResourceMessage creates notification message for specific resource alerts
func (snm *ServerNotificationManager) generateResourceMessage(payload *NotificationPayload, template *ServerNotificationTemplate, resourceType string) string {
	var baseMessage string

	// Select appropriate resource message from template based on status
	if template != nil {
		// log.Printf("🔧 Using template for resource type: %s with status: %s", resourceType, payload.Status)
		
		// Check if this is a recovery/restore notification
		if payload.Status == "up" {
			// Use restore messages for recovery notifications
			switch strings.ToLower(resourceType) {
			case "cpu":
				baseMessage = template.RestoreCPUMessage
			case "ram", "memory":
				baseMessage = template.RestoreRAMMessage
			case "disk":
				baseMessage = template.RestoreDiskMessage
			case "network":
				baseMessage = template.RestoreNetworkMessage
			case "cpu_temp", "cpu_temperature":
				baseMessage = template.RestoreCPUTempMessage
			case "disk_io":
				baseMessage = template.RestoreDiskIOMessage
			default:
				baseMessage = template.UpMessage // fallback to general up message
			}
		} else {
			// Use regular alert messages for warning/down notifications
			switch strings.ToLower(resourceType) {
			case "cpu":
				baseMessage = template.CPUMessage
			case "ram", "memory":
				baseMessage = template.RAMMessage
			case "disk":
				baseMessage = template.DiskMessage
			case "network":
				baseMessage = template.NetworkMessage
			case "cpu_temp", "cpu_temperature":
				baseMessage = template.CPUTempMessage
			case "disk_io":
				baseMessage = template.DiskIOMessage
			default:
				baseMessage = template.WarningMessage // fallback to warning message
			}
		}
		
		// log.Printf("📝 Template message selected for %s (status: %s): %s", resourceType, payload.Status, baseMessage)
	}

	// If no template or empty message, use default
	if baseMessage == "" {
		// log.Printf("🔧 Using default message for resource %s", resourceType)
		baseMessage = snm.getDefaultResourceMessage(payload, resourceType)
	}

	// Replace placeholders with actual values
	message := snm.replacePlaceholders(baseMessage, payload)
	
	// log.Printf("📝 Final resource message after placeholder replacement: %s", message)
	return message
}

// getDefaultResourceMessage provides default messages for resource alerts
func (snm *ServerNotificationManager) getDefaultResourceMessage(payload *NotificationPayload, resourceType string) string {
	statusEmoji := "⚠️"
	statusText := "Alert"
	
	if payload.Status == "up" {
		statusEmoji = "✅"
		statusText = "Recovery"
	} else if payload.Status == "down" {
		statusEmoji = "❌"
		statusText = "Critical"
	}

	switch strings.ToLower(resourceType) {
	case "cpu":
		if payload.Status == "up" {
			return fmt.Sprintf("%s CPU %s: Server %s CPU usage has returned to normal: %s", statusEmoji, statusText, payload.ServiceName, payload.CPUUsage)
		}
		return fmt.Sprintf("%s CPU %s: Server %s CPU usage is %s", statusEmoji, statusText, payload.ServiceName, payload.CPUUsage)
	case "ram", "memory":
		if payload.Status == "up" {
			return fmt.Sprintf("%s RAM %s: Server %s RAM usage has returned to normal: %s", statusEmoji, statusText, payload.ServiceName, payload.RAMUsage)
		}
		return fmt.Sprintf("%s RAM %s: Server %s RAM usage is %s", statusEmoji, statusText, payload.ServiceName, payload.RAMUsage)
	case "disk":
		if payload.Status == "up" {
			return fmt.Sprintf("%s Disk %s: Server %s disk usage has returned to normal: %s", statusEmoji, statusText, payload.ServiceName, payload.DiskUsage)
		}
		return fmt.Sprintf("%s Disk %s: Server %s disk usage is %s", statusEmoji, statusText, payload.ServiceName, payload.DiskUsage)
	case "network":
		if payload.Status == "up" {
			return fmt.Sprintf("%s Network %s: Server %s network usage has returned to normal: %s", statusEmoji, statusText, payload.ServiceName, payload.NetworkUsage)
		}
		return fmt.Sprintf("%s Network %s: Server %s network usage is %s", statusEmoji, statusText, payload.ServiceName, payload.NetworkUsage)
	case "cpu_temp", "cpu_temperature":
		if payload.Status == "up" {
			return fmt.Sprintf("%s CPU Temperature %s: Server %s CPU temperature has returned to normal: %s", statusEmoji, statusText, payload.ServiceName, payload.CPUTemp)
		}
		return fmt.Sprintf("%s CPU Temperature %s: Server %s CPU temperature is %s", statusEmoji, statusText, payload.ServiceName, payload.CPUTemp)
	case "disk_io":
		if payload.Status == "up" {
			return fmt.Sprintf("%s Disk I/O %s: Server %s disk I/O has returned to normal: %s", statusEmoji, statusText, payload.ServiceName, payload.DiskIO)
		}
		return fmt.Sprintf("%s Disk I/O %s: Server %s disk I/O is %s", statusEmoji, statusText, payload.ServiceName, payload.DiskIO)
	default:
		if payload.Status == "up" {
			return fmt.Sprintf("%s Resource %s: Server %s %s has recovered", statusEmoji, statusText, payload.ServiceName, payload.Message)
		}
		return fmt.Sprintf("%s Resource %s: Server %s %s", statusEmoji, statusText, payload.ServiceName, payload.Message)
	}
}

// generateMessage creates notification message from template or default
func (snm *ServerNotificationManager) generateMessage(payload *NotificationPayload, template *ServerNotificationTemplate) string {
	var baseMessage string

	// Select appropriate message based on status and template
	if template != nil {
		// log.Printf("🔧 Using template for status: %s", strings.ToLower(payload.Status))
		switch strings.ToLower(payload.Status) {
		case "up":
			baseMessage = template.UpMessage
		case "down":
			baseMessage = template.DownMessage
		case "warning":
			baseMessage = template.WarningMessage
		case "paused":
			baseMessage = template.PausedMessage
		default:
			baseMessage = template.UpMessage // fallback
		}
		// log.Printf("📝 Template message selected: %s", baseMessage)
	}

	// If no template or empty message, use default
	if baseMessage == "" {
		// log.Printf("🔧 Using default message (no template or empty template message)")
		baseMessage = snm.getDefaultMessage(payload)
	}

	// Replace placeholders with actual values
	message := snm.replacePlaceholders(baseMessage, payload)
	
	// log.Printf("📝 Final message after placeholder replacement: %s", message)
	return message
}

// replacePlaceholders replaces all placeholders in the message with actual values
func (snm *ServerNotificationManager) replacePlaceholders(message string, payload *NotificationPayload) string {
	// Service/Server name placeholders
	message = strings.ReplaceAll(message, "${service_name}", payload.ServiceName)
	message = strings.ReplaceAll(message, "${server_name}", payload.ServiceName) // For server notifications
	
	// Status placeholder
	message = strings.ReplaceAll(message, "${status}", strings.ToUpper(payload.Status))
	
	// Host/IP placeholders
	message = strings.ReplaceAll(message, "${host}", payload.Host)
	message = strings.ReplaceAll(message, "${ip}", payload.Host) // Alternative placeholder
	message = strings.ReplaceAll(message, "${ip_address}", payload.Host) // New server monitoring placeholder

	// Hostname placeholder
	message = strings.ReplaceAll(message, "${hostname}", payload.Hostname)
	
	// Port placeholder
	if payload.Port > 0 {
		message = strings.ReplaceAll(message, "${port}", fmt.Sprintf("%d", payload.Port))
	} else {
		message = strings.ReplaceAll(message, "${port}", "N/A")
	}
	
	// Response time placeholder
	if payload.ResponseTime > 0 {
		message = strings.ReplaceAll(message, "${response_time}", fmt.Sprintf("%dms", payload.ResponseTime))
	} else {
		message = strings.ReplaceAll(message, "${response_time}", "N/A")
	}
	
	// Timestamp placeholders
	message = strings.ReplaceAll(message, "${timestamp}", payload.Timestamp.Format("2006-01-02 15:04:05"))
	message = strings.ReplaceAll(message, "${time}", payload.Timestamp.Format("2006-01-02 15:04:05"))
	message = strings.ReplaceAll(message, "${date}", payload.Timestamp.Format("2006-01-02"))
	
	// Service type placeholder
	message = strings.ReplaceAll(message, "${service_type}", payload.ServiceType)
	
	// Error message placeholder
	if payload.ErrorMessage != "" {
		message = strings.ReplaceAll(message, "${error}", payload.ErrorMessage)
		message = strings.ReplaceAll(message, "${error_message}", payload.ErrorMessage)
	} else {
		message = strings.ReplaceAll(message, "${error}", "")
		message = strings.ReplaceAll(message, "${error_message}", "")
	}
	
	// Custom message placeholder
	if payload.Message != "" {
		message = strings.ReplaceAll(message, "${message}", payload.Message)
	}

	// Server monitoring specific placeholders
	if payload.CPUUsage != "" {
		message = strings.ReplaceAll(message, "${cpu_usage}", payload.CPUUsage)
	} else {
		message = strings.ReplaceAll(message, "${cpu_usage}", "N/A")
	}

	if payload.RAMUsage != "" {
		message = strings.ReplaceAll(message, "${ram_usage}", payload.RAMUsage)
	} else {
		message = strings.ReplaceAll(message, "${ram_usage}", "N/A")
	}

	if payload.DiskUsage != "" {
		message = strings.ReplaceAll(message, "${disk_usage}", payload.DiskUsage)
	} else {
		message = strings.ReplaceAll(message, "${disk_usage}", "N/A")
	}

	if payload.NetworkUsage != "" {
		message = strings.ReplaceAll(message, "${network_usage}", payload.NetworkUsage)
	} else {
		message = strings.ReplaceAll(message, "${network_usage}", "N/A")
	}

	if payload.CPUTemp != "" {
		message = strings.ReplaceAll(message, "${cpu_temp}", payload.CPUTemp)
	} else {
		message = strings.ReplaceAll(message, "${cpu_temp}", "N/A")
	}

	if payload.DiskIO != "" {
		message = strings.ReplaceAll(message, "${disk_io}", payload.DiskIO)
	} else {
		message = strings.ReplaceAll(message, "${disk_io}", "N/A")
	}

	if payload.Threshold != "" {
		message = strings.ReplaceAll(message, "${threshold}", payload.Threshold)
	} else {
		message = strings.ReplaceAll(message, "${threshold}", "N/A")
	}

	return message
}

// getDefaultMessage provides a default notification message
func (snm *ServerNotificationManager) getDefaultMessage(payload *NotificationPayload) string {
	statusEmoji := "✅"
	if payload.Status == "down" {
		statusEmoji = "❌"
	} else if payload.Status == "warning" {
		statusEmoji = "⚠️"
	}

	message := fmt.Sprintf("%s Server Alert\n\n", statusEmoji)
	message += fmt.Sprintf("Server: %s\n", payload.ServiceName)
	message += fmt.Sprintf("Status: %s\n", strings.ToUpper(payload.Status))
	message += fmt.Sprintf("IP Address: %s\n", payload.Host)
	
	if payload.CPUUsage != "" {
		message += fmt.Sprintf("CPU Usage: %s\n", payload.CPUUsage)
	}
	
	if payload.RAMUsage != "" {
		message += fmt.Sprintf("RAM Usage: %s\n", payload.RAMUsage)
	}
	
	if payload.DiskUsage != "" {
		message += fmt.Sprintf("Disk Usage: %s\n", payload.DiskUsage)
	}
	
	message += fmt.Sprintf("Time: %s\n", payload.Timestamp.Format("2006-01-02 15:04:05"))
	
	if payload.ErrorMessage != "" {
		message += fmt.Sprintf("Error: %s\n", payload.ErrorMessage)
	}

	return message
}