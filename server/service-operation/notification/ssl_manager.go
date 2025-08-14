
package notification

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"service-operation/pocketbase"
)

// SSLNotificationTemplate represents an SSL notification template
type SSLNotificationTemplate struct {
	ID           string `json:"id"`
	Name         string `json:"name"`
	Expired      string `json:"expired"`
	ExpiringSoon string `json:"exiring_soon"`
	Warning      string `json:"warning"`
	Placeholder  string `json:"placeholder"`
}

// SSLNotificationManager handles SSL certificate notifications
type SSLNotificationManager struct {
	pbClient *pocketbase.PocketBaseClient
	services map[string]NotificationService
}

// NewSSLNotificationManager creates a new SSL notification manager
func NewSSLNotificationManager(pbClient *pocketbase.PocketBaseClient, services map[string]NotificationService) *SSLNotificationManager {
	return &SSLNotificationManager{
		pbClient: pbClient,
		services: services,
	}
}

// SendSSLNotification sends notification for SSL certificate status
func (snm *SSLNotificationManager) SendSSLNotification(payload *NotificationPayload, notificationID, templateID string) error {
	// log.Printf("📨 [SSL-MANAGER] IMMEDIATE send for certificate: %s, status: %s", payload.Domain, payload.Status)
	// log.Printf("📨 [SSL-MANAGER] Notification ID: %s, Template ID: %s", notificationID, templateID)
	
	if notificationID == "" {
		return fmt.Errorf("notification ID required for SSL certificate: %s", payload.Domain)
	}

	// Parse notification IDs
	notificationIDs := parseNotificationIDs(notificationID)
	if len(notificationIDs) == 0 {
		return fmt.Errorf("no valid notification IDs for SSL certificate: %s", payload.Domain)
	}

	var errors []string
	successCount := 0

	// Send to each notification channel IMMEDIATELY
	for _, id := range notificationIDs {
		// log.Printf("📤 [SSL-SEND] Processing notification ID: %s for certificate %s", id, payload.Domain)
		
		// Check if enabled
		if !isNotificationEnabled(snm.pbClient, id) {
			// log.Printf("⚠️ Notification %s disabled for SSL certificate %s, skipping", id, payload.Domain)
			_ = id
			continue
		}

		// Get alert configuration
		alertConfig, err := getAlertConfiguration(snm.pbClient, id)
		if err != nil {
			// log.Printf("❌ Failed to get alert config for %s (certificate: %s): %v", id, payload.Domain, err)
			errors = append(errors, fmt.Sprintf("config error %s: %v", id, err))
			continue
		}

		// log.Printf("📋 [SSL-CONFIG] Alert config for %s: Type=%s, ChatID=%s, Token present=%v", 
		//	id, alertConfig.NotificationType, alertConfig.TelegramChatID, alertConfig.BotToken != "")

		// Get SSL template
		var sslTemplate *SSLNotificationTemplate
		if templateID != "" {
			sslTemplate, err = snm.getSSLNotificationTemplate(templateID)
			if err != nil {
				// log.Printf("⚠️ Template error for %s (certificate: %s): %v", templateID, payload.Domain, err)
				_ = err
			} else {
				// log.Printf("📄 [SSL-TEMPLATE] Retrieved template: Expired=%s, ExpiringSoon=%s, Warning=%s", 
				//	sslTemplate.Expired, sslTemplate.ExpiringSoon, sslTemplate.Warning)
				_ = sslTemplate
			}
		}

		// Generate message
		message := snm.generateSSLMessage(payload, sslTemplate)
		// log.Printf("📝 [SSL-MESSAGE] Generated for %s (%s): %s", payload.Domain, id, message)

		// Get notification service
		service, exists := snm.services[alertConfig.NotificationType]
		if !exists {
			// log.Printf("❌ Unsupported notification type for SSL: %s", alertConfig.NotificationType)
			errors = append(errors, fmt.Sprintf("unsupported type %s", alertConfig.NotificationType))
			continue
		}

		// SEND IMMEDIATELY - NO DELAYS
		// log.Printf("⚡ [SSL-TELEGRAM] Sending via %s for SSL certificate %s", alertConfig.NotificationType, payload.Domain)
		err = service.SendNotification(alertConfig, message)
		if err != nil {
			// log.Printf("❌ [SSL-FAILED] Failed to send via %s for %s: %v", alertConfig.NotificationType, payload.Domain, err)
			errors = append(errors, fmt.Sprintf("send failed %s: %v", alertConfig.NotificationType, err))
		} else {
			// log.Printf("✅ [SSL-SUCCESS] Successfully sent via %s for %s", alertConfig.NotificationType, payload.Domain)
			successCount++
		}
		
		_ = alertConfig
		_ = message
	}

	// Report results
	if successCount > 0 {
		// log.Printf("✅ [SSL-FINAL] Sent %d/%d SSL notifications for %s", successCount, len(notificationIDs), payload.Domain)
		_ = successCount
		_ = notificationIDs
	}

	if len(errors) > 0 && successCount == 0 {
		return fmt.Errorf("all SSL notifications failed for %s: %v", payload.Domain, errors)
	}

	return nil
}

// getSSLNotificationTemplate fetches SSL notification template from PocketBase
func (snm *SSLNotificationManager) getSSLNotificationTemplate(templateID string) (*SSLNotificationTemplate, error) {
	url := fmt.Sprintf("%s/api/collections/ssl_notification_templates/records/%s", snm.pbClient.GetBaseURL(), templateID)
	// log.Printf("🌐 Fetching SSL notification template from: %s", url)
	
	resp, err := http.Get(url)
	if err != nil {
		// log.Printf("❌ HTTP error fetching SSL notification template: %v", err)
		_ = err
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		// log.Printf("❌ Failed to fetch SSL notification template, status: %d", resp.StatusCode)
		return nil, fmt.Errorf("failed to fetch SSL notification template, status: %d", resp.StatusCode)
	}

	var template SSLNotificationTemplate
	if err := json.NewDecoder(resp.Body).Decode(&template); err != nil {
		// log.Printf("❌ Error decoding SSL notification template JSON: %v", err)
		_ = err
		return nil, err
	}

	// log.Printf("✅ Successfully fetched SSL notification template: %+v", template)
	_ = url
	_ = template
	return &template, nil
}

// generateSSLMessage creates notification message for SSL certificates
func (snm *SSLNotificationManager) generateSSLMessage(payload *NotificationPayload, template *SSLNotificationTemplate) string {
	var baseMessage string

	// Use template if available
	if template != nil {
		// log.Printf("🔧 Using SSL template for status: %s", strings.ToLower(payload.Status))
		// log.Printf("🔧 [SSL-TEMPLATE-DEBUG] Available templates - Expired: '%s', ExpiringSoon: '%s', Warning: '%s'", 
		//	template.Expired, template.ExpiringSoon, template.Warning)
		
		switch strings.ToLower(payload.Status) {
		case "expired":
			baseMessage = template.Expired
			// log.Printf("🔧 [SSL-EXPIRED] Selected expired template: '%s'", baseMessage)
		case "expiring_soon":
			baseMessage = template.ExpiringSoon
			// log.Printf("🔧 [SSL-EXPIRING] Selected expiring soon template: '%s'", baseMessage)
		case "warning":
			baseMessage = template.Warning
			// log.Printf("🔧 [SSL-WARNING] Selected warning template: '%s'", baseMessage)
		default:
			baseMessage = template.Warning
			// log.Printf("🔧 [SSL-DEFAULT] Using warning template for status '%s': '%s'", payload.Status, baseMessage)
		}
		
		_ = baseMessage
		_ = template
	}

	// Use default if no template or template message is empty
	if baseMessage == "" {
		// log.Printf("🔧 Using default SSL message (no template or empty template)")
		baseMessage = snm.getDefaultSSLMessage(payload)
	}

	// Replace placeholders
	message := snm.replaceSSLPlaceholders(baseMessage, payload)
	
	// log.Printf("📝 Final SSL message: %s", message)
	_ = message
	return message
}

// replaceSSLPlaceholders replaces all placeholders in the SSL message
func (snm *SSLNotificationManager) replaceSSLPlaceholders(message string, payload *NotificationPayload) string {
	// log.Printf("🔄 [SSL-REPLACE] Before replacement: %s", message)
	// log.Printf("🔄 [SSL-DATA] Payload data - Domain: %s, ExpiryDate: %s, DaysLeft: %s, IssuerCN: %s", 
	//	payload.Domain, payload.ExpiryDate, payload.DaysLeft, payload.IssuerCN)

	// SSL Certificate specific placeholders - ensure all are replaced
	message = strings.ReplaceAll(message, "${domain}", snm.safeString(payload.Domain))
	message = strings.ReplaceAll(message, "${certificate_name}", snm.safeString(payload.CertificateName))
	message = strings.ReplaceAll(message, "${expiry_date}", snm.safeString(payload.ExpiryDate))
	message = strings.ReplaceAll(message, "${days_left}", snm.safeString(payload.DaysLeft))
	message = strings.ReplaceAll(message, "${issuer_cn}", snm.safeString(payload.IssuerCN))
	message = strings.ReplaceAll(message, "${serial_number}", snm.safeString(payload.SerialNumber))
	
	// Basic placeholders
	message = strings.ReplaceAll(message, "${status}", strings.ToUpper(payload.Status))
	message = strings.ReplaceAll(message, "${service_name}", snm.safeString(payload.ServiceName))
	message = strings.ReplaceAll(message, "${host}", snm.safeString(payload.Host))
	
	// Time placeholders
	message = strings.ReplaceAll(message, "${timestamp}", payload.Timestamp.Format("2006-01-02 15:04:05"))
	message = strings.ReplaceAll(message, "${time}", payload.Timestamp.Format("15:04:05"))
	message = strings.ReplaceAll(message, "${date}", payload.Timestamp.Format("2006-01-02"))
	
	// Message placeholder
	if payload.Message != "" {
		message = strings.ReplaceAll(message, "${message}", payload.Message)
	} else {
		message = strings.ReplaceAll(message, "${message}", "N/A")
	}

	// log.Printf("🔄 [SSL-REPLACE] After replacement: %s", message)
	_ = payload
	return message
}

// safeString returns the string value or "N/A" if empty
func (snm *SSLNotificationManager) safeString(value string) string {
	if value == "" {
		return "N/A"
	}
	return value
}

// getDefaultSSLMessage provides a default notification message for SSL certificates
func (snm *SSLNotificationManager) getDefaultSSLMessage(payload *NotificationPayload) string {
	statusEmoji := "🔒"
	if payload.Status == "expired" {
		statusEmoji = "🚨"
	} else if payload.Status == "expiring_soon" {
		statusEmoji = "⚠️"
	} else if payload.Status == "warning" {
		statusEmoji = "🔔"
	}

	// Create the default message with all SSL details
	message := fmt.Sprintf("%s SSL certificate for %s has %s", statusEmoji, payload.Domain, strings.ToUpper(payload.Status))
	
	// Add certificate details if available
	if payload.CertificateName != "" && payload.CertificateName != payload.Domain {
		message += fmt.Sprintf("\n • Certs Name: %s", payload.CertificateName)
	}
	
	if payload.ExpiryDate != "" {
		message += fmt.Sprintf("\n • Expiry Date: %s", payload.ExpiryDate)
	}
	
	if payload.DaysLeft != "" {
		message += fmt.Sprintf("\n • Days Left: %s", payload.DaysLeft)
	}
	
	if payload.IssuerCN != "" {
		message += fmt.Sprintf("\n • Issuer: %s", payload.IssuerCN)
	}
	
	// Add timestamp
	message += fmt.Sprintf("\n • Time: %s", payload.Timestamp.Format("2006-01-02 15:04:05"))

	return message
}