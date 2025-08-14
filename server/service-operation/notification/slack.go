package notification

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"
)

// SlackService handles Slack notifications
type SlackService struct{}

// NewSlackService creates a new Slack notification service
func NewSlackService() *SlackService {
	return &SlackService{}
}

// SlackPayload represents the payload for Slack webhook
type SlackPayload struct {
	Text        string            `json:"text"`
	Username    string            `json:"username,omitempty"`
	Channel     string            `json:"channel,omitempty"`
	IconEmoji   string            `json:"icon_emoji,omitempty"`
	Attachments []SlackAttachment `json:"attachments,omitempty"`
	Blocks      []SlackBlock      `json:"blocks,omitempty"`
}

// SlackAttachment represents a Slack attachment
type SlackAttachment struct {
	Color     string `json:"color,omitempty"`
	Title     string `json:"title,omitempty"`
	Text      string `json:"text,omitempty"`
	Timestamp int64  `json:"ts,omitempty"`
	Fields    []SlackField `json:"fields,omitempty"`
}

// SlackField represents a field in Slack attachment
type SlackField struct {
	Title string `json:"title"`
	Value string `json:"value"`
	Short bool   `json:"short"`
}

// SlackBlock represents a Slack block element
type SlackBlock struct {
	Type string      `json:"type"`
	Text *SlackText  `json:"text,omitempty"`
}

// SlackText represents text in Slack blocks
type SlackText struct {
	Type string `json:"type"`
	Text string `json:"text"`
}

// SendNotification sends a notification via Slack webhook
func (ss *SlackService) SendNotification(config *AlertConfiguration, message string) error {
	if config.SlackWebhookURL == "" {
		return fmt.Errorf("slack webhook URL is required")
	}

	// Parse and format the message for better Slack presentation
	formattedPayload := ss.createSlackPayload(config, message)
	
	jsonData, err := json.Marshal(formattedPayload)
	if err != nil {
		return err
	}

	resp, err := http.Post(config.SlackWebhookURL, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("slack webhook error, status: %d", resp.StatusCode)
	}

	return nil
}

// SendServerNotification sends a server-specific notification via Slack
func (ss *SlackService) SendServerNotification(config *AlertConfiguration, payload *NotificationPayload, template *ServerNotificationTemplate, resourceType string) error {
	message := ss.generateServerMessage(payload, template, resourceType)
	return ss.SendNotification(config, message)
}

// SendServiceNotification sends a service-specific notification via Slack
func (ss *SlackService) SendServiceNotification(config *AlertConfiguration, payload *NotificationPayload, template *ServiceNotificationTemplate) error {
	message := ss.generateServiceMessage(payload, template)
	return ss.SendNotification(config, message)
}

// createSlackPayload creates a properly formatted Slack payload with rich formatting
func (ss *SlackService) createSlackPayload(config *AlertConfiguration, message string) SlackPayload {
	// Determine color based on message content
	color := ss.getColorFromMessage(message)
	
	// Parse message for structured presentation
	title, fields := ss.parseMessageForSlack(message)
	
	payload := SlackPayload{
		Username:  config.NotifyName,
		IconEmoji: ss.getEmojiFromMessage(message),
		Text:      title,
	}

	// Create attachment for better formatting
	if len(fields) > 0 {
		attachment := SlackAttachment{
			Color:     color,
			Title:     title,
			Timestamp: time.Now().Unix(),
			Fields:    fields,
		}
		payload.Attachments = []SlackAttachment{attachment}
		payload.Text = "" // Clear text when using attachments
	}

	return payload
}

// parseMessageForSlack parses the message to extract title and create structured fields
func (ss *SlackService) parseMessageForSlack(message string) (string, []SlackField) {
	lines := strings.Split(message, "\n")
	if len(lines) == 0 {
		return message, nil
	}

	title := strings.TrimSpace(lines[0])
	var fields []SlackField

	// Process bullet points and key-value pairs
	for i, line := range lines {
		if i == 0 {
			continue // Skip title
		}

		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}

		// Handle bullet points (•, -, *)
		if strings.HasPrefix(line, "•") || strings.HasPrefix(line, "-") || strings.HasPrefix(line, "*") {
			// Remove bullet and clean up
			cleaned := strings.TrimSpace(strings.TrimPrefix(strings.TrimPrefix(strings.TrimPrefix(line, "•"), "-"), "*"))
			
			// Try to split on colon for key-value pairs
			if strings.Contains(cleaned, ":") {
				parts := strings.SplitN(cleaned, ":", 2)
				if len(parts) == 2 {
					key := strings.TrimSpace(parts[0])
					value := strings.TrimSpace(parts[1])
					fields = append(fields, SlackField{
						Title: key,
						Value: value,
						Short: len(value) < 30, // Short fields for compact display
					})
				}
			} else {
				// Add as a single field
				fields = append(fields, SlackField{
					Title: "Info",
					Value: cleaned,
					Short: false,
				})
			}
		} else if strings.Contains(line, ":") {
			// Direct key-value pairs
			parts := strings.SplitN(line, ":", 2)
			if len(parts) == 2 {
				key := strings.TrimSpace(parts[0])
				value := strings.TrimSpace(parts[1])
				fields = append(fields, SlackField{
					Title: key,
					Value: value,
					Short: len(value) < 30,
				})
			}
		}
	}

	return title, fields
}

// getColorFromMessage determines the appropriate color based on message content
func (ss *SlackService) getColorFromMessage(message string) string {
	lowerMsg := strings.ToLower(message)
	
	// Critical/Error states - Red
	if strings.Contains(lowerMsg, "down") || strings.Contains(lowerMsg, "failed") || 
	   strings.Contains(lowerMsg, "error") || strings.Contains(lowerMsg, "expired") ||
	   strings.Contains(lowerMsg, "🔴") || strings.Contains(lowerMsg, "🚨") {
		return "#FF0000" // Red
	}
	
	// Warning states - Yellow/Orange
	if strings.Contains(lowerMsg, "warning") || strings.Contains(lowerMsg, "expiring") ||
	   strings.Contains(lowerMsg, "🟡") || strings.Contains(lowerMsg, "⚠️") {
		return "#FFA500" // Orange
	}
	
	// Success states - Green
	if strings.Contains(lowerMsg, "up") || strings.Contains(lowerMsg, "restored") ||
	   strings.Contains(lowerMsg, "resolved") || strings.Contains(lowerMsg, "🟢") ||
	   strings.Contains(lowerMsg, "✅") {
		return "#00FF00" // Green
	}
	
	// Maintenance/Info states - Blue
	if strings.Contains(lowerMsg, "maintenance") || strings.Contains(lowerMsg, "paused") ||
	   strings.Contains(lowerMsg, "🟠") || strings.Contains(lowerMsg, "🔵") {
		return "#0080FF" // Blue
	}
	
	return "#808080" // Default gray
}

// getEmojiFromMessage extracts or determines appropriate emoji for the message
func (ss *SlackService) getEmojiFromMessage(message string) string {
	lowerMsg := strings.ToLower(message)
	
	// Check for specific service types first
	if strings.Contains(lowerMsg, "server") {
		if strings.Contains(lowerMsg, "down") || strings.Contains(lowerMsg, "failed") {
			return ":red_circle:"
		} else if strings.Contains(lowerMsg, "warning") {
			return ":warning:"
		} else if strings.Contains(lowerMsg, "up") || strings.Contains(lowerMsg, "restored") {
			return ":white_check_mark:"
		}
		return ":desktop_computer:"
	}
	
	// SSL Certificate notifications
	if strings.Contains(lowerMsg, "certificate") || strings.Contains(lowerMsg, "ssl") {
		if strings.Contains(lowerMsg, "expired") {
			return ":no_entry:"
		} else if strings.Contains(lowerMsg, "expiring") {
			return ":warning:"
		}
		return ":lock:"
	}
	
	// General status-based emojis
	if strings.Contains(lowerMsg, "down") || strings.Contains(lowerMsg, "failed") {
		return ":red_circle:"
	} else if strings.Contains(lowerMsg, "warning") {
		return ":warning:"
	} else if strings.Contains(lowerMsg, "up") || strings.Contains(lowerMsg, "restored") {
		return ":white_check_mark:"
	} else if strings.Contains(lowerMsg, "maintenance") {
		return ":construction:"
	}
	
	return ":information_source:" // Default info emoji
}

// generateServerMessage creates a message for server notifications using server template
func (ss *SlackService) generateServerMessage(payload *NotificationPayload, template *ServerNotificationTemplate, resourceType string) string {
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
func (ss *SlackService) generateServiceMessage(payload *NotificationPayload, template *ServiceNotificationTemplate) string {
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
func (ss *SlackService) replacePlaceholders(message string, payload *NotificationPayload) string {
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
	
	// Replace SSL certificate fields
	message = strings.ReplaceAll(message, "${certificate_name}", ss.safeString(payload.CertificateName))
	message = strings.ReplaceAll(message, "${expiry_date}", ss.safeString(payload.ExpiryDate))
	message = strings.ReplaceAll(message, "${days_left}", ss.safeString(payload.DaysLeft))
	message = strings.ReplaceAll(message, "${issuer_cn}", ss.safeString(payload.IssuerCN))
	message = strings.ReplaceAll(message, "${serial_number}", ss.safeString(payload.SerialNumber))
	
	// Replace error message - important for uptime services
	message = strings.ReplaceAll(message, "${error_message}", ss.safeString(payload.ErrorMessage))
	message = strings.ReplaceAll(message, "${error}", ss.safeString(payload.ErrorMessage))
	
	// Replace time placeholders
	message = strings.ReplaceAll(message, "${time}", payload.Timestamp.Format("2006-01-02 15:04:05"))
	message = strings.ReplaceAll(message, "${timestamp}", payload.Timestamp.Format("2006-01-02 15:04:05"))
	message = strings.ReplaceAll(message, "${date}", payload.Timestamp.Format("2006-01-02"))
	
	// Replace message placeholder
	if payload.Message != "" {
		message = strings.ReplaceAll(message, "${message}", payload.Message)
	} else {
		message = strings.ReplaceAll(message, "${message}", "N/A")
	}
	
	return message
}

// safeString returns the string value or "N/A" if empty
func (ss *SlackService) safeString(value string) string {
	if value == "" {
		return "N/A"
	}
	return value
}

// generateDefaultUptimeMessage creates a default uptime message with proper formatting
func (ss *SlackService) generateDefaultUptimeMessage(payload *NotificationPayload) string {
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
	
	message := fmt.Sprintf("%s Service %s is %s", statusEmoji, payload.ServiceName, strings.ToUpper(payload.Status))
	
	// Build formatted details
	details := []string{}
	
	// Add URL or host
	if payload.URL != "" {
		details = append(details, fmt.Sprintf("• Host URL: %s", payload.URL))
	} else if payload.Host != "" {
		details = append(details, fmt.Sprintf("• Host: %s", payload.Host))
	}
	
	// Add service type
	if payload.ServiceType != "" {
		details = append(details, fmt.Sprintf("• Type: %s", strings.ToUpper(payload.ServiceType)))
	}
	
	// Add port if available
	if payload.Port > 0 {
		details = append(details, fmt.Sprintf("• Port: %d", payload.Port))
	}
	
	// Add domain if available
	if payload.Domain != "" {
		details = append(details, fmt.Sprintf("• Domain: %s", payload.Domain))
	}
	
	// Add response time
	if payload.ResponseTime > 0 {
		details = append(details, fmt.Sprintf("• Response time: %dms", payload.ResponseTime))
	} else {
		details = append(details, "• Response time: N/A")
	}
	
	// Add region info
	if payload.RegionName != "" {
		details = append(details, fmt.Sprintf("• Region: %s", payload.RegionName))
	}
	
	// Add agent info
	if payload.AgentID != "" {
		details = append(details, fmt.Sprintf("• Agent: %s", payload.AgentID))
	}
	
	// Add uptime if available
	if payload.Uptime > 0 {
		details = append(details, fmt.Sprintf("• Uptime: %d%%", payload.Uptime))
	}
	
	// Add timestamp
	details = append(details, fmt.Sprintf("• Time: %s", payload.Timestamp.Format("2006-01-02 15:04:05")))
	
	// Combine message with details
	if len(details) > 0 {
		message += "\n" + strings.Join(details, "\n")
	}
	
	return message
}

// generateDefaultServerMessage creates a default server message
func (ss *SlackService) generateDefaultServerMessage(payload *NotificationPayload, resourceType string) string {
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