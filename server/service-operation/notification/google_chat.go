
package notification

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
)

// GoogleChatService handles Google Chat notifications
type GoogleChatService struct{}

// NewGoogleChatService creates a new Google Chat notification service
func NewGoogleChatService() *GoogleChatService {
	return &GoogleChatService{}
}

// GoogleChatPayload represents the payload for Google Chat webhook
type GoogleChatPayload struct {
	Text string `json:"text"`
}

// SendNotification sends a notification via Google Chat webhook
func (gcs *GoogleChatService) SendNotification(config *AlertConfiguration, message string) error {
	// fmt.Printf("💬 [GOOGLE_CHAT] Attempting to send notification...\n")
	// fmt.Printf("💬 [GOOGLE_CHAT] Config - Webhook URL present: %v\n", config.GoogleChatWebhookURL != "")
	// fmt.Printf("💬 [GOOGLE_CHAT] Message: %s\n", message)

	if config.GoogleChatWebhookURL == "" {
		return fmt.Errorf("google chat webhook URL is required")
	}

	payload := GoogleChatPayload{
		Text: message,
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		// fmt.Printf("❌ [GOOGLE_CHAT] JSON marshal error: %v\n", err)
		return err
	}

	// fmt.Printf("💬 [GOOGLE_CHAT] Sending POST request to webhook...\n")
	resp, err := http.Post(config.GoogleChatWebhookURL, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		// fmt.Printf("❌ [GOOGLE_CHAT] HTTP error: %v\n", err)
		return err
	}
	defer resp.Body.Close()

	// fmt.Printf("💬 [GOOGLE_CHAT] Response status: %d\n", resp.StatusCode)

	if resp.StatusCode != http.StatusOK {
		// fmt.Printf("❌ [GOOGLE_CHAT] Webhook error, status: %d\n", resp.StatusCode)
		return fmt.Errorf("google chat webhook error, status: %d", resp.StatusCode)
	}

	// fmt.Printf("✅ [GOOGLE_CHAT] Message sent successfully!\n")
	return nil
}

// SendServerNotification sends a server-specific notification via Google Chat
func (gcs *GoogleChatService) SendServerNotification(config *AlertConfiguration, payload *NotificationPayload, template *ServerNotificationTemplate, resourceType string) error {
	message := gcs.generateServerMessage(payload, template, resourceType)
	return gcs.SendNotification(config, message)
}

// SendServiceNotification sends a service-specific notification via Google Chat
func (gcs *GoogleChatService) SendServiceNotification(config *AlertConfiguration, payload *NotificationPayload, template *ServiceNotificationTemplate) error {
	message := gcs.generateServiceMessage(payload, template)
	return gcs.SendNotification(config, message)
}

// generateServerMessage creates a message for server notifications using server template
func (gcs *GoogleChatService) generateServerMessage(payload *NotificationPayload, template *ServerNotificationTemplate, resourceType string) string {
	var templateMessage string
	
	// Select appropriate template message based on status and resource type
	switch strings.ToLower(payload.Status) {
	case "down":
		templateMessage = template.DownMessage
	case "up":
		templateMessage = template.UpMessage
	case "warning":
		templateMessage = template.WarningMessage
	case "paused":
		templateMessage = template.PausedMessage
	default:
		// Handle resource-specific messages
		switch resourceType {
		case "cpu":
			if strings.Contains(strings.ToLower(payload.Status), "restore") {
				templateMessage = template.RestoreCPUMessage
			} else {
				templateMessage = template.CPUMessage
			}
		case "ram", "memory":
			if strings.Contains(strings.ToLower(payload.Status), "restore") {
				templateMessage = template.RestoreRAMMessage
			} else {
				templateMessage = template.RAMMessage
			}
		case "disk":
			if strings.Contains(strings.ToLower(payload.Status), "restore") {
				templateMessage = template.RestoreDiskMessage
			} else {
				templateMessage = template.DiskMessage
			}
		case "network":
			if strings.Contains(strings.ToLower(payload.Status), "restore") {
				templateMessage = template.RestoreNetworkMessage
			} else {
				templateMessage = template.NetworkMessage
			}
		case "cpu_temp", "cpu_temperature":
			if strings.Contains(strings.ToLower(payload.Status), "restore") {
				templateMessage = template.RestoreCPUTempMessage
			} else {
				templateMessage = template.CPUTempMessage
			}
		case "disk_io":
			if strings.Contains(strings.ToLower(payload.Status), "restore") {
				templateMessage = template.RestoreDiskIOMessage
			} else {
				templateMessage = template.DiskIOMessage
			}
		default:
			templateMessage = template.WarningMessage
		}
	}
	
	// If no template message found, use a default
	if templateMessage == "" {
		templateMessage = gcs.generateDefaultServerMessage(payload, resourceType)
	}
	
	return gcs.replacePlaceholders(templateMessage, payload)
}

// generateServiceMessage creates a message for service notifications using service template
func (gcs *GoogleChatService) generateServiceMessage(payload *NotificationPayload, template *ServiceNotificationTemplate) string {
	var templateMessage string
	
	// Select appropriate template message based on status
	switch strings.ToLower(payload.Status) {
	case "up":
		templateMessage = template.UpMessage
	case "down":
		templateMessage = template.DownMessage
	case "maintenance":
		templateMessage = template.MaintenanceMessage
	case "incident":
		templateMessage = template.IncidentMessage
	case "resolved":
		templateMessage = template.ResolvedMessage
	case "warning":
		templateMessage = template.WarningMessage
	default:
		templateMessage = template.WarningMessage
	}
	
	// If no template message found, use a default
	if templateMessage == "" {
		templateMessage = gcs.generateDefaultUptimeMessage(payload)
	}
	
	return gcs.replacePlaceholders(templateMessage, payload)
}

// replacePlaceholders replaces all placeholders in the message with actual values
func (gcs *GoogleChatService) replacePlaceholders(message string, payload *NotificationPayload) string {
	// Replace basic placeholders
	message = strings.ReplaceAll(message, "${service_name}", payload.ServiceName)
	message = strings.ReplaceAll(message, "${status}", strings.ToUpper(payload.Status))
	message = strings.ReplaceAll(message, "${host}", gcs.safeString(payload.Host))
	message = strings.ReplaceAll(message, "${hostname}", gcs.safeString(payload.Hostname))
	
	// Replace URL with fallback to host
	url := gcs.safeString(payload.URL)
	if url == "N/A" && payload.Host != "" {
		url = payload.Host
	}
	message = strings.ReplaceAll(message, "${url}", url)
	
	// Replace domain
	message = strings.ReplaceAll(message, "${domain}", gcs.safeString(payload.Domain))
	
	// Replace service type
	if payload.ServiceType != "" {
		message = strings.ReplaceAll(message, "${service_type}", strings.ToUpper(payload.ServiceType))
	} else {
		message = strings.ReplaceAll(message, "${service_type}", "N/A")
	}
	
	// Replace region and agent info
	message = strings.ReplaceAll(message, "${region_name}", gcs.safeString(payload.RegionName))
	message = strings.ReplaceAll(message, "${agent_id}", gcs.safeString(payload.AgentID))
	
	// Handle numeric fields safely
	if payload.Port > 0 {
		message = strings.ReplaceAll(message, "${port}", fmt.Sprintf("%d", payload.Port))
	} else {
		message = strings.ReplaceAll(message, "${port}", "N/A")
	}
	
	if payload.ResponseTime > 0 {
		message = strings.ReplaceAll(message, "${response_time}", fmt.Sprintf("%dms", payload.ResponseTime))
	} else {
		message = strings.ReplaceAll(message, "${response_time}", "N/A")
	}
	
	if payload.Uptime > 0 {
		message = strings.ReplaceAll(message, "${uptime}", fmt.Sprintf("%d%%", payload.Uptime))
	} else {
		message = strings.ReplaceAll(message, "${uptime}", "N/A")
	}
	
	// Replace server monitoring fields
	message = strings.ReplaceAll(message, "${cpu_usage}", gcs.safeString(payload.CPUUsage))
	message = strings.ReplaceAll(message, "${ram_usage}", gcs.safeString(payload.RAMUsage))
	message = strings.ReplaceAll(message, "${disk_usage}", gcs.safeString(payload.DiskUsage))
	message = strings.ReplaceAll(message, "${network_usage}", gcs.safeString(payload.NetworkUsage))
	message = strings.ReplaceAll(message, "${cpu_temp}", gcs.safeString(payload.CPUTemp))
	message = strings.ReplaceAll(message, "${disk_io}", gcs.safeString(payload.DiskIO))
	message = strings.ReplaceAll(message, "${threshold}", gcs.safeString(payload.Threshold))
	
	// Replace error message - important for uptime services
	message = strings.ReplaceAll(message, "${error_message}", gcs.safeString(payload.ErrorMessage))
	message = strings.ReplaceAll(message, "${error}", gcs.safeString(payload.ErrorMessage))
	
	// Replace time placeholders
	message = strings.ReplaceAll(message, "${time}", payload.Timestamp.Format("2006-01-02 15:04:05"))
	message = strings.ReplaceAll(message, "${timestamp}", payload.Timestamp.Format("2006-01-02 15:04:05"))
	
	return message
}

// safeString returns the string value or "N/A" if empty
func (gcs *GoogleChatService) safeString(value string) string {
	if value == "" {
		return "N/A"
	}
	return value
}

// generateDefaultUptimeMessage creates a default uptime message with proper formatting
func (gcs *GoogleChatService) generateDefaultUptimeMessage(payload *NotificationPayload) string {
	// Status emoji mapping for Google Chat
	statusEmoji := "🔵"
	switch strings.ToLower(payload.Status) {
	case "up":
		statusEmoji = "🟢"
	case "down":
		statusEmoji = "🔴"
	case "warning":
		statusEmoji = "🟡"
	case "maintenance", "paused":
		statusEmoji = "🟠"
	}
	
	message := fmt.Sprintf("%s Service %s is %s.", statusEmoji, payload.ServiceName, strings.ToUpper(payload.Status))
	
	// Build formatted details
	details := []string{}
	
	// Add URL or host
	if payload.URL != "" {
		details = append(details, fmt.Sprintf(" - Host URL: %s", payload.URL))
	} else if payload.Host != "" {
		details = append(details, fmt.Sprintf(" - Host: %s", payload.Host))
	}
	
	// Add service type
	if payload.ServiceType != "" {
		details = append(details, fmt.Sprintf(" - Type: %s", strings.ToUpper(payload.ServiceType)))
	}
	
	// Add port if available
	if payload.Port > 0 {
		details = append(details, fmt.Sprintf(" - Port: %d", payload.Port))
	}
	
	// Add domain if available
	if payload.Domain != "" {
		details = append(details, fmt.Sprintf(" - Domain: %s", payload.Domain))
	}
	
	// Add response time
	if payload.ResponseTime > 0 {
		details = append(details, fmt.Sprintf(" - Response time: %dms", payload.ResponseTime))
	} else {
		details = append(details, " - Response time: N/A")
	}
	
	// Add region info
	if payload.RegionName != "" {
		details = append(details, fmt.Sprintf(" - Region: %s", payload.RegionName))
	}
	
	// Add agent info
	if payload.AgentID != "" {
		details = append(details, fmt.Sprintf(" - Agent: %s", payload.AgentID))
	}
	
	// Add uptime if available
	if payload.Uptime > 0 {
		details = append(details, fmt.Sprintf(" - Uptime: %d%%", payload.Uptime))
	}
	
	// Add timestamp
	details = append(details, fmt.Sprintf(" - Time: %s", payload.Timestamp.Format("2006-01-02 15:04:05")))
	
	// Combine message with details
	if len(details) > 0 {
		message += "\n" + strings.Join(details, "\n")
	}
	
	return message
}

// generateDefaultServerMessage creates a default server message
func (gcs *GoogleChatService) generateDefaultServerMessage(payload *NotificationPayload, resourceType string) string {
	statusEmoji := "🔵"
	switch strings.ToLower(payload.Status) {
	case "up":
		statusEmoji = "🟢"
	case "down":
		statusEmoji = "🔴"
	case "warning":
		statusEmoji = "🟡"
	}
	
	return fmt.Sprintf("%s🖥️ Server %s (%s) status: %s", statusEmoji, payload.ServiceName, payload.Hostname, strings.ToUpper(payload.Status))
}