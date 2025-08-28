package notification

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
)

// PushoverService handles Pushover notifications
type PushoverService struct{}

// NewPushoverService creates a new Pushover notification service
func NewPushoverService() *PushoverService {
	return &PushoverService{}
}

// PushoverPayload represents the payload for Pushover API
type PushoverPayload struct {
	Token   string `json:"token"`
	User    string `json:"user"`
	Message string `json:"message"`
	Title   string `json:"title,omitempty"`
}

// PushoverResponse represents the response from Pushover API
type PushoverResponse struct {
	Status  int      `json:"status"`
	Request string   `json:"request"`
	User    string   `json:"user,omitempty"`
	Errors  []string `json:"errors,omitempty"`
}

// SendNotification sends a notification via Pushover
func (ps *PushoverService) SendNotification(config *AlertConfiguration, message string) error {
	// fmt.Printf("📱 [PUSHOVER] Attempting to send notification...\n")
	// fmt.Printf("📱 [PUSHOVER] Config - API Token: %s, User Key: %s, Notify Name: %s\n", 
	//     maskToken(config.APIToken), maskToken(config.UserKey), config.NotifyName)
	// fmt.Printf("📱 [PUSHOVER] Message: %s\n", message)

	if config.APIToken == "" || config.UserKey == "" {
		return fmt.Errorf("Pushover API token and user key are required")
	}

	// Prepare the payload
	payload := PushoverPayload{
		Token:   config.APIToken,
		User:    config.UserKey,
		Message: message,
		Title:   config.NotifyName, // Use notify_name as the title
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		// fmt.Printf("❌ [PUSHOVER] JSON marshal error: %v\n", err)
		return err
	}

	// fmt.Printf("📱 [PUSHOVER] Payload: %s\n", string(jsonData))
	// fmt.Printf("📱 [PUSHOVER] Sending POST request to Pushover API...\n")

	// Send the request to Pushover API
	resp, err := http.Post("https://api.pushover.net/1/messages.json", "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		// fmt.Printf("❌ [PUSHOVER] HTTP error: %v\n", err)
		return err
	}
	defer resp.Body.Close()

	// Parse the response
	var pushoverResp PushoverResponse
	if err := json.NewDecoder(resp.Body).Decode(&pushoverResp); err != nil {
		// fmt.Printf("❌ [PUSHOVER] Response decode error: %v\n", err)
		return err
	}

	// fmt.Printf("📱 [PUSHOVER] API response: %+v\n", pushoverResp)

	// Check if the request was successful
	if pushoverResp.Status != 1 {
		errorMsg := "Unknown error"
		if len(pushoverResp.Errors) > 0 {
			errorMsg = strings.Join(pushoverResp.Errors, ", ")
		}
		// fmt.Printf("❌ [PUSHOVER] API error: %s\n", errorMsg)
		return fmt.Errorf("Pushover API error: %s", errorMsg)
	}

	// fmt.Printf("✅ [PUSHOVER] Message sent successfully!\n")
	return nil
}

// SendServerNotification sends a server-specific notification via Pushover
func (ps *PushoverService) SendServerNotification(config *AlertConfiguration, payload *NotificationPayload, template *ServerNotificationTemplate, resourceType string) error {
	message := ps.generateServerMessage(payload, template, resourceType)
	return ps.SendNotification(config, message)
}

// SendServiceNotification sends a service-specific notification via Pushover
func (ps *PushoverService) SendServiceNotification(config *AlertConfiguration, payload *NotificationPayload, template *ServiceNotificationTemplate) error {
	message := ps.generateServiceMessage(payload, template)
	return ps.SendNotification(config, message)
}

// generateServerMessage creates a message for server notifications using server template
func (ps *PushoverService) generateServerMessage(payload *NotificationPayload, template *ServerNotificationTemplate, resourceType string) string {
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
		templateMessage = ps.generateDefaultServerMessage(payload, resourceType)
	}
	
	return ps.replacePlaceholders(templateMessage, payload)
}

// generateServiceMessage creates a message for service notifications using service template
func (ps *PushoverService) generateServiceMessage(payload *NotificationPayload, template *ServiceNotificationTemplate) string {
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
		templateMessage = ps.generateDefaultUptimeMessage(payload)
	}
	
	return ps.replacePlaceholders(templateMessage, payload)
}

// replacePlaceholders replaces all placeholders in the message with actual values
func (ps *PushoverService) replacePlaceholders(message string, payload *NotificationPayload) string {
	// Replace basic placeholders
	message = strings.ReplaceAll(message, "${service_name}", payload.ServiceName)
	message = strings.ReplaceAll(message, "${server_name}", payload.ServiceName) // server_name maps to service_name
	message = strings.ReplaceAll(message, "${status}", strings.ToUpper(payload.Status))
	message = strings.ReplaceAll(message, "${host}", ps.safeString(payload.Host))
	message = strings.ReplaceAll(message, "${hostname}", ps.safeString(payload.Hostname))
	
	// Replace URL with fallback to host
	url := ps.safeString(payload.URL)
	if url == "N/A" && payload.Host != "" {
		url = payload.Host
	}
	message = strings.ReplaceAll(message, "${url}", url)
	
	// Replace domain
	message = strings.ReplaceAll(message, "${domain}", ps.safeString(payload.Domain))
	
	// Replace service type
	if payload.ServiceType != "" {
		message = strings.ReplaceAll(message, "${service_type}", strings.ToUpper(payload.ServiceType))
	} else {
		message = strings.ReplaceAll(message, "${service_type}", "N/A")
	}
	
	// Replace region and agent info
	message = strings.ReplaceAll(message, "${region_name}", ps.safeString(payload.RegionName))
	message = strings.ReplaceAll(message, "${agent_id}", ps.safeString(payload.AgentID))
	
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
	message = strings.ReplaceAll(message, "${cpu_usage}", ps.safeString(payload.CPUUsage))
	message = strings.ReplaceAll(message, "${ram_usage}", ps.safeString(payload.RAMUsage))
	message = strings.ReplaceAll(message, "${disk_usage}", ps.safeString(payload.DiskUsage))
	message = strings.ReplaceAll(message, "${network_usage}", ps.safeString(payload.NetworkUsage))
	message = strings.ReplaceAll(message, "${cpu_temp}", ps.safeString(payload.CPUTemp))
	message = strings.ReplaceAll(message, "${disk_io}", ps.safeString(payload.DiskIO))
	message = strings.ReplaceAll(message, "${threshold}", ps.safeString(payload.Threshold))
	
	// Replace SSL certificate fields
	message = strings.ReplaceAll(message, "${certificate_name}", ps.safeString(payload.CertificateName))
	message = strings.ReplaceAll(message, "${expiry_date}", ps.safeString(payload.ExpiryDate))
	message = strings.ReplaceAll(message, "${days_left}", ps.safeString(payload.DaysLeft))
	message = strings.ReplaceAll(message, "${issuer_cn}", ps.safeString(payload.IssuerCN))
	message = strings.ReplaceAll(message, "${issuer}", ps.safeString(payload.IssuerCN)) // alias
	
	// Replace error message - important for uptime services
	message = strings.ReplaceAll(message, "${error_message}", ps.safeString(payload.ErrorMessage))
	message = strings.ReplaceAll(message, "${error}", ps.safeString(payload.ErrorMessage))
	message = strings.ReplaceAll(message, "${message}", ps.safeString(payload.Message))
	
	// Replace time placeholders
	message = strings.ReplaceAll(message, "${time}", payload.Timestamp.Format("2006-01-02 15:04:05"))
	message = strings.ReplaceAll(message, "${timestamp}", payload.Timestamp.Format("2006-01-02 15:04:05"))
	
	return message
}

// safeString returns the string value or "N/A" if empty
func (ps *PushoverService) safeString(value string) string {
	if value == "" {
		return "N/A"
	}
	return value
}

// generateDefaultUptimeMessage creates a default uptime message with proper formatting
func (ps *PushoverService) generateDefaultUptimeMessage(payload *NotificationPayload) string {
	message := fmt.Sprintf("Service %s is %s.", payload.ServiceName, strings.ToUpper(payload.Status))
	
	// Build formatted details
	details := []string{}
	
	// Add URL or host
	if payload.URL != "" {
		details = append(details, fmt.Sprintf("Host URL: %s", payload.URL))
	} else if payload.Host != "" {
		details = append(details, fmt.Sprintf("Host: %s", payload.Host))
	}
	
	// Add service type
	if payload.ServiceType != "" {
		details = append(details, fmt.Sprintf("Type: %s", strings.ToUpper(payload.ServiceType)))
	}
	
	// Add port if available
	if payload.Port > 0 {
		details = append(details, fmt.Sprintf("Port: %d", payload.Port))
	}
	
	// Add domain if available
	if payload.Domain != "" {
		details = append(details, fmt.Sprintf("Domain: %s", payload.Domain))
	}
	
	// Add response time
	if payload.ResponseTime > 0 {
		details = append(details, fmt.Sprintf("Response time: %dms", payload.ResponseTime))
	} else {
		details = append(details, "Response time: N/A")
	}
	
	// Add region info
	if payload.RegionName != "" {
		details = append(details, fmt.Sprintf("Region: %s", payload.RegionName))
	}
	
	// Add agent info
	if payload.AgentID != "" {
		details = append(details, fmt.Sprintf("Agent: %s", payload.AgentID))
	}
	
	// Add uptime if available
	if payload.Uptime > 0 {
		details = append(details, fmt.Sprintf("Uptime: %d%%", payload.Uptime))
	}
	
	// Add timestamp
	details = append(details, fmt.Sprintf("Time: %s", payload.Timestamp.Format("2006-01-02 15:04:05")))
	
	// Combine message with details
	if len(details) > 0 {
		message += "\n" + strings.Join(details, "\n")
	}
	
	return message
}

// generateDefaultServerMessage creates a default server message
func (ps *PushoverService) generateDefaultServerMessage(payload *NotificationPayload, resourceType string) string {
	return fmt.Sprintf("Server %s (%s) status: %s", payload.ServiceName, payload.Hostname, strings.ToUpper(payload.Status))
}

// maskToken masks a token for logging purposes
func maskToken(token string) string {
	if len(token) <= 8 {
		return strings.Repeat("*", len(token))
	}
	return token[:4] + strings.Repeat("*", len(token)-8) + token[len(token)-4:]
}