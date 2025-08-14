
package notification

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
)

// SignalService handles Signal notifications
type SignalService struct{}

// NewSignalService creates a new Signal notification service
func NewSignalService() *SignalService {
	return &SignalService{}
}

// SignalPayload represents the payload for Signal REST API
type SignalPayload struct {
	Number     string   `json:"number"`
	Recipients []string `json:"recipients"`
	Message    string   `json:"message"`
}

// SendNotification sends a notification via Signal REST API
func (ss *SignalService) SendNotification(config *AlertConfiguration, message string) error {
	// fmt.Printf("📱 [SIGNAL] Attempting to send notification...\n")
	// fmt.Printf("📱 [SIGNAL] Config - Phone Number: %s, API Endpoint: %s\n", config.SignalNumber, config.SignalAPIEndpoint)
	// fmt.Printf("📱 [SIGNAL] Message: %s\n", message)

	if config.SignalNumber == "" {
		return fmt.Errorf("signal phone number is required")
	}

	if config.SignalAPIEndpoint == "" {
		return fmt.Errorf("signal API endpoint is required")
	}

	// Use the configured endpoint directly (it should already include the full path like /v2/send)
	apiURL := config.SignalAPIEndpoint
	// fmt.Printf("📱 [SIGNAL] API URL: %s\n", apiURL)

	// Prepare payload for Signal REST API
	payload := SignalPayload{
		Number:     config.SignalNumber, // This should be the sender's number (registered with signal-cli)
		Recipients: []string{config.SignalNumber}, // Send to the same number for now
		Message:    message,
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		// fmt.Printf("❌ [SIGNAL] JSON marshal error: %v\n", err)
		return fmt.Errorf("failed to marshal signal payload: %v", err)
	}

	// fmt.Printf("📱 [SIGNAL] Payload: %s\n", string(jsonData))
	// fmt.Printf("📱 [SIGNAL] Sending POST request...\n")

	// Send POST request to Signal REST API
	resp, err := http.Post(apiURL, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		// fmt.Printf("❌ [SIGNAL] HTTP error: %v\n", err)
		return fmt.Errorf("failed to send signal request: %v", err)
	}
	defer resp.Body.Close()

	// fmt.Printf("📱 [SIGNAL] Response Status: %d\n", resp.StatusCode)

	// Check if the request was successful
	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		// fmt.Printf("❌ [SIGNAL] HTTP Status error: %d\n", resp.StatusCode)
		
		// Try to read error response
		var errorResponse map[string]interface{}
		if err := json.NewDecoder(resp.Body).Decode(&errorResponse); err == nil {
			// fmt.Printf("❌ [SIGNAL] Error response: %+v\n", errorResponse)
			return fmt.Errorf("signal API error (status %d): %v", resp.StatusCode, errorResponse)
		}
		
		return fmt.Errorf("signal API returned status %d", resp.StatusCode)
	}

	// Parse response
	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		// fmt.Printf("❌ [SIGNAL] JSON decode error: %v\n", err)
		// Don't fail if we can't decode response but got success status
		// fmt.Printf("✅ [SIGNAL] Message sent successfully (response decode failed but status was OK)!\n")
		return nil
	}

	// fmt.Printf("📱 [SIGNAL] Response: %+v\n", result)
	// fmt.Printf("✅ [SIGNAL] Message sent successfully!\n")
	return nil
}

// SendServerNotification sends a server-specific notification via Signal
func (ss *SignalService) SendServerNotification(config *AlertConfiguration, payload *NotificationPayload, template *ServerNotificationTemplate, resourceType string) error {
	message := ss.generateServerMessage(payload, template, resourceType)
	return ss.SendNotification(config, message)
}

// SendServiceNotification sends a service-specific notification via Signal
func (ss *SignalService) SendServiceNotification(config *AlertConfiguration, payload *NotificationPayload, template *ServiceNotificationTemplate) error {
	message := ss.generateServiceMessage(payload, template)
	return ss.SendNotification(config, message)
}

// generateServerMessage creates a message for server notifications using server template
func (ss *SignalService) generateServerMessage(payload *NotificationPayload, template *ServerNotificationTemplate, resourceType string) string {
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
		templateMessage = ss.generateDefaultServerMessage(payload, resourceType)
	}
	
	return ss.replacePlaceholders(templateMessage, payload)
}

// generateServiceMessage creates a message for service notifications using service template
func (ss *SignalService) generateServiceMessage(payload *NotificationPayload, template *ServiceNotificationTemplate) string {
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
		templateMessage = ss.generateDefaultUptimeMessage(payload)
	}
	
	return ss.replacePlaceholders(templateMessage, payload)
}

// replacePlaceholders replaces all placeholders in the message with actual values
func (ss *SignalService) replacePlaceholders(message string, payload *NotificationPayload) string {
	// Replace basic placeholders
	message = strings.ReplaceAll(message, "${service_name}", payload.ServiceName)
	message = strings.ReplaceAll(message, "${status}", strings.ToUpper(payload.Status))
	message = strings.ReplaceAll(message, "${host}", ss.safeString(payload.Host))
	message = strings.ReplaceAll(message, "${hostname}", ss.safeString(payload.Hostname))
	
	// Replace URL with fallback to host
	url := ss.safeString(payload.URL)
	if url == "N/A" && payload.Host != "" {
		url = payload.Host
	}
	message = strings.ReplaceAll(message, "${url}", url)
	
	// Replace domain
	message = strings.ReplaceAll(message, "${domain}", ss.safeString(payload.Domain))
	
	// Replace service type
	if payload.ServiceType != "" {
		message = strings.ReplaceAll(message, "${service_type}", strings.ToUpper(payload.ServiceType))
	} else {
		message = strings.ReplaceAll(message, "${service_type}", "N/A")
	}
	
	// Replace region and agent info
	message = strings.ReplaceAll(message, "${region_name}", ss.safeString(payload.RegionName))
	message = strings.ReplaceAll(message, "${agent_id}", ss.safeString(payload.AgentID))
	
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
	message = strings.ReplaceAll(message, "${cpu_usage}", ss.safeString(payload.CPUUsage))
	message = strings.ReplaceAll(message, "${ram_usage}", ss.safeString(payload.RAMUsage))
	message = strings.ReplaceAll(message, "${disk_usage}", ss.safeString(payload.DiskUsage))
	message = strings.ReplaceAll(message, "${network_usage}", ss.safeString(payload.NetworkUsage))
	message = strings.ReplaceAll(message, "${cpu_temp}", ss.safeString(payload.CPUTemp))
	message = strings.ReplaceAll(message, "${disk_io}", ss.safeString(payload.DiskIO))
	message = strings.ReplaceAll(message, "${threshold}", ss.safeString(payload.Threshold))
	
	// Replace error message - important for uptime services
	message = strings.ReplaceAll(message, "${error_message}", ss.safeString(payload.ErrorMessage))
	message = strings.ReplaceAll(message, "${error}", ss.safeString(payload.ErrorMessage))
	
	// Replace time placeholders
	message = strings.ReplaceAll(message, "${time}", payload.Timestamp.Format("2006-01-02 15:04:05"))
	message = strings.ReplaceAll(message, "${timestamp}", payload.Timestamp.Format("2006-01-02 15:04:05"))
	
	return message
}

// safeString returns the string value or "N/A" if empty
func (ss *SignalService) safeString(value string) string {
	if value == "" {
		return "N/A"
	}
	return value
}

// generateDefaultUptimeMessage creates a default uptime message with proper formatting
func (ss *SignalService) generateDefaultUptimeMessage(payload *NotificationPayload) string {
	// Status emoji mapping
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
func (ss *SignalService) generateDefaultServerMessage(payload *NotificationPayload, resourceType string) string {
	statusEmoji := "🔵"
	switch strings.ToLower(payload.Status) {
	case "up":
		statusEmoji = "🟢"
	case "down":
		statusEmoji = "🔴"
	case "warning":
		statusEmoji = "🟡"
	}
	
	return fmt.Sprintf("%s 🖥️ Server %s (%s) status: %s", statusEmoji, payload.ServiceName, payload.Hostname, strings.ToUpper(payload.Status))
}