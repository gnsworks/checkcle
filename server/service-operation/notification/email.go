package notification

import (
	"crypto/tls"
	"fmt"
	"net/smtp"
	"strconv"
	"strings"
	"time"
)

// EmailService handles email notifications
type EmailService struct{}

// NewEmailService creates a new email notification service
func NewEmailService() *EmailService {
	// log.Printf("✅ Email notification service initialized")
	return &EmailService{}
}

// SendNotification sends a notification via email
func (es *EmailService) SendNotification(config *AlertConfiguration, message string) error {
	// log.Printf("📧 === SENDING EMAIL NOTIFICATION ===")
	// log.Printf("🔔 Email notification request received")
	// log.Printf("📊 Email Configuration:")
	// log.Printf("  - Email Address: %s", config.EmailAddress)
	// log.Printf("  - Sender Name: %s", config.EmailSenderName)
	// log.Printf("  - SMTP Server: %s", config.SMTPServer)
	// log.Printf("  - SMTP Port: %s", config.SMTPPort)
	// log.Printf("  - SMTP Password present: %t", config.SMTPPassword != "")
	// log.Printf("  - Message Length: %d chars", len(message))

	// Validate email configuration
	if config.EmailAddress == "" || config.SMTPServer == "" || config.SMTPPort == "" {
		// log.Printf("❌ EMAIL CONFIGURATION ERROR: Missing required fields")
		// log.Printf("  - Email Address present: %t", config.EmailAddress != "")
		// log.Printf("  - SMTP Server present: %t", config.SMTPServer != "")
		// log.Printf("  - SMTP Port present: %t", config.SMTPPort != "")
		return fmt.Errorf("email configuration is incomplete")
	}

	if config.SMTPPassword == "" {
		// log.Printf("⚠️  WARNING: SMTP password not provided - authentication may fail")
	}

	port, err := strconv.Atoi(config.SMTPPort)
	if err != nil {
		// log.Printf("❌ SMTP PORT ERROR: Invalid port '%s': %v", config.SMTPPort, err)
		return fmt.Errorf("invalid SMTP port: %v", err)
	}

	// log.Printf("✅ Email configuration validation passed")
	// log.Printf("🔧 Parsed SMTP Port: %d", port)

	// Determine alert severity and get appropriate emoji/color
	severity, emoji := es.parseMessageSeverity(message)
	// log.Printf("📋 Message Analysis:")
	// log.Printf("  - Detected Severity: %s", severity)
	// log.Printf("  - Emoji: %s", emoji)

	// Create enhanced email content
	subject := es.createEmailSubject(config.EmailSenderName, severity)
	htmlBody := es.createHTMLEmailBody(message, severity, emoji)
	plainBody := es.createPlainEmailBody(message, severity, emoji)

	// log.Printf("📝 Email Content Created:")
	// log.Printf("  - Subject: %s", subject)
	// log.Printf("  - HTML Body Length: %d chars", len(htmlBody))
	// log.Printf("  - Plain Body Length: %d chars", len(plainBody))

	// Prepare email message with both HTML and plain text
	emailMessage := es.createMIMEMessage(config.EmailSenderName, config.EmailAddress, subject, htmlBody, plainBody)

	// log.Printf("📤 Preparing to send email...")
	// log.Printf("  - SMTP Server: %s:%d", config.SMTPServer, port)
	// log.Printf("  - From: %s", config.EmailSenderName)
	// log.Printf("  - To: %s", config.EmailAddress)

	// Send email with enhanced SMTP handling
	err = es.sendSMTPEmail(config.SMTPServer, port, config.EmailSenderName, config.EmailAddress, config.SMTPPassword, emailMessage)
	if err != nil {
		// log.Printf("❌ EMAIL SENDING FAILED: %v", err)
		// log.Printf("❌ Error Details:")
		// log.Printf("  - SMTP Server: %s:%d", config.SMTPServer, port)
		// log.Printf("  - Error Type: %T", err)
		// log.Printf("  - Error Message: %s", err.Error())
		return fmt.Errorf("failed to send email: %v", err)
	}

	// log.Printf("✅ EMAIL SENT SUCCESSFULLY")
	// log.Printf("✅ Email Details:")
	// log.Printf("  - Recipient: %s", config.EmailAddress)
	// log.Printf("  - Subject: %s", subject)
	// log.Printf("  - Severity: %s", severity)
	// log.Printf("  - Timestamp: %s", time.Now().Format("2006-01-02 15:04:05"))
	// log.Printf("=== EMAIL NOTIFICATION COMPLETE ===")

	return nil
}

// parseMessageSeverity analyzes the message to determine severity level
func (es *EmailService) parseMessageSeverity(message string) (string, string) {
	messageUpper := strings.ToUpper(message)
	
	// Check for critical indicators
	if strings.Contains(messageUpper, "🚨") || strings.Contains(messageUpper, "CRITICAL") || 
	   strings.Contains(messageUpper, "DOWN") || strings.Contains(messageUpper, "ERROR") ||
	   strings.Contains(messageUpper, "FAILED") || strings.Contains(messageUpper, "🔴") {
		return "CRITICAL", "🚨"
	}
	
	// Check for warning indicators
	if strings.Contains(messageUpper, "⚠️") || strings.Contains(messageUpper, "WARNING") || 
	   strings.Contains(messageUpper, "🟡") || strings.Contains(messageUpper, "INCIDENT") {
		return "WARNING", "⚠️"
	}
	
	// Check for success indicators
	if strings.Contains(messageUpper, "🟢") || strings.Contains(messageUpper, "UP") || 
	   strings.Contains(messageUpper, "SUCCESS") || strings.Contains(messageUpper, "RESOLVED") ||
	   strings.Contains(messageUpper, "RESTORED") {
		return "SUCCESS", "✅"
	}
	
	// Check for maintenance indicators
	if strings.Contains(messageUpper, "🟠") || strings.Contains(messageUpper, "MAINTENANCE") || 
	   strings.Contains(messageUpper, "PAUSED") {
		return "MAINTENANCE", "🔧"
	}
	
	// Default to info
	return "INFO", "ℹ️"
}

// createEmailSubject creates an appropriate email subject
func (es *EmailService) createEmailSubject(senderName, severity string) string {
	prefix := "Service Alert"
	if senderName != "" {
		prefix = fmt.Sprintf("%s - Service Alert", senderName)
	}
	
	switch severity {
	case "CRITICAL":
		return fmt.Sprintf("🚨 [CRITICAL] %s", prefix)
	case "WARNING":
		return fmt.Sprintf("⚠️ [WARNING] %s", prefix)
	case "SUCCESS":
		return fmt.Sprintf("✅ [RESOLVED] %s", prefix)
	case "MAINTENANCE":
		return fmt.Sprintf("🔧 [MAINTENANCE] %s", prefix)
	default:
		return fmt.Sprintf("ℹ️ [INFO] %s", prefix)
	}
}

// createHTMLEmailBody creates a rich HTML email body
func (es *EmailService) createHTMLEmailBody(message, severity, emoji string) string {
	// Get color scheme based on severity
	var bgColor, borderColor, textColor string
	switch severity {
	case "CRITICAL":
		bgColor = "#fee2e2"
		borderColor = "#dc2626"
		textColor = "#991b1b"
	case "WARNING":
		bgColor = "#fef3c7"
		borderColor = "#d97706"
		textColor = "#92400e"
	case "SUCCESS":
		bgColor = "#dcfce7"
		borderColor = "#16a34a"
		textColor = "#15803d"
	case "MAINTENANCE":
		bgColor = "#fed7aa"
		borderColor = "#ea580c"
		textColor = "#c2410c"
	default:
		bgColor = "#dbeafe"
		borderColor = "#2563eb"
		textColor = "#1d4ed8"
	}

	// Format message content for HTML
	htmlMessage := strings.ReplaceAll(message, "\n", "<br>")
	
	// Enhance bullet points and formatting
	htmlMessage = strings.ReplaceAll(htmlMessage, " - ", "<br>&nbsp;&nbsp;• ")
	htmlMessage = strings.ReplaceAll(htmlMessage, "Service:", "<strong>Service:</strong>")
	htmlMessage = strings.ReplaceAll(htmlMessage, "Status:", "<strong>Status:</strong>")
	htmlMessage = strings.ReplaceAll(htmlMessage, "Host:", "<strong>Host:</strong>")
	htmlMessage = strings.ReplaceAll(htmlMessage, "Type:", "<strong>Type:</strong>")
	htmlMessage = strings.ReplaceAll(htmlMessage, "Response time:", "<strong>Response time:</strong>")
	htmlMessage = strings.ReplaceAll(htmlMessage, "Time:", "<strong>Time:</strong>")
	htmlMessage = strings.ReplaceAll(htmlMessage, "Domain:", "<strong>Domain:</strong>")
	htmlMessage = strings.ReplaceAll(htmlMessage, "Days Remaining:", "<strong>Days Remaining:</strong>")
	htmlMessage = strings.ReplaceAll(htmlMessage, "Expiration Date:", "<strong>Expiration Date:</strong>")

	return fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Service Alert Notification</title>
</head>
<body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background-color: %s; color: %s; padding: 20px; border-radius: 8px 8px 0 0; border-left: 4px solid %s;">
            <h2 style="margin: 0; font-size: 18px;">
                %s Service Alert Notification
            </h2>
        </div>
        
        <!-- Content -->
        <div style="padding: 20px;">
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; border-left: 3px solid %s;">
                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #333;">
                    %s
                </p>
            </div>
            
            <!-- Footer -->
            <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0; font-size: 12px; color: #6b7280; text-align: center;">
                    This is an automated notification from your monitoring system.<br>
                    Generated at: %s
                </p>
            </div>
        </div>
    </div>
</body>
</html>`, 
		bgColor, textColor, borderColor, emoji, borderColor, htmlMessage, time.Now().Format("2006-01-02 15:04:05 MST"))
}

// createPlainEmailBody creates a plain text email body
func (es *EmailService) createPlainEmailBody(message, severity, emoji string) string {
	separator := strings.Repeat("=", 50)
	
	return fmt.Sprintf(`%s
%s SERVICE ALERT NOTIFICATION
%s

%s

%s
This is an automated notification from your monitoring system.
Generated at: %s
%s`, 
		separator, 
		emoji+" "+severity, 
		separator, 
		message, 
		separator, 
		time.Now().Format("2006-01-02 15:04:05 MST"),
		separator)
}

// createMIMEMessage creates a MIME message with both HTML and plain text
func (es *EmailService) createMIMEMessage(fromName, toEmail, subject, htmlBody, plainBody string) string {
	boundary := fmt.Sprintf("boundary_%d", time.Now().Unix())
	
	headers := fmt.Sprintf(`From: %s
To: %s
Subject: %s
MIME-Version: 1.0
Content-Type: multipart/alternative; boundary="%s"

`, fromName, toEmail, subject, boundary)

	body := fmt.Sprintf(`--%s
Content-Type: text/plain; charset=UTF-8
Content-Transfer-Encoding: 7bit

%s

--%s
Content-Type: text/html; charset=UTF-8
Content-Transfer-Encoding: 7bit

%s

--%s--
`, boundary, plainBody, boundary, htmlBody, boundary)

	return headers + body
}

// sendSMTPEmail sends the email using SMTP with proper authentication
func (es *EmailService) sendSMTPEmail(smtpServer string, port int, fromEmail, toEmail, password, message string) error {
	addr := fmt.Sprintf("%s:%d", smtpServer, port)
	
	// log.Printf("🔌 Connecting to SMTP server: %s", addr)
	
	// Extract hostname from SMTP server for proper HELO
	hostname := smtpServer
	if strings.Contains(hostname, ".") {
		// Use the SMTP server hostname for HELO
		hostname = smtpServer
	}
	
	// log.Printf("🔧 Using hostname for HELO: %s", hostname)
	
	// For port 587 (STARTTLS) - most common for authenticated SMTP
	if port == 587 {
		// log.Printf("🔐 Attempting STARTTLS connection with authentication...")
		return es.sendWithSTARTTLSAuth(addr, hostname, fromEmail, toEmail, password, message)
	}
	
	// For port 465 (SSL/TLS)
	if port == 465 {
		// log.Printf("🔒 Attempting SSL connection with authentication...")
		return es.sendWithSSLAuth(addr, hostname, fromEmail, toEmail, password, message)
	}
	
	// For port 25 (Plain SMTP with optional STARTTLS)
	if port == 25 {
		// log.Printf("📧 Attempting plain SMTP with optional STARTTLS...")
		return es.sendWithSTARTTLSAuth(addr, hostname, fromEmail, toEmail, password, message)
	}
	
	// Fallback to STARTTLS for any other port
	// log.Printf("📧 Using STARTTLS with auth fallback for port %d...", port)
	return es.sendWithSTARTTLSAuth(addr, hostname, fromEmail, toEmail, password, message)
}

// sendWithSTARTTLSAuth sends email with STARTTLS and authentication
func (es *EmailService) sendWithSTARTTLSAuth(addr, hostname, fromEmail, toEmail, password, message string) error {
	// log.Printf("🔐 Establishing STARTTLS connection to %s", addr)
	
	// Connect to server
	client, err := smtp.Dial(addr)
	if err != nil {
		// log.Printf("❌ Failed to connect to SMTP server: %v", err)
		return fmt.Errorf("failed to connect to SMTP server: %v", err)
	}
	defer client.Close()
	
	// Send EHLO with proper hostname
	// log.Printf("👋 Sending EHLO with hostname: %s", hostname)
	if err = client.Hello(hostname); err != nil {
		// log.Printf("❌ EHLO failed: %v", err)
		return fmt.Errorf("EHLO failed: %v", err)
	}
	
	// Check if STARTTLS is supported and use it
	if ok, _ := client.Extension("STARTTLS"); ok {
		// log.Printf("🔐 STARTTLS supported, initiating TLS...")
		tlsConfig := &tls.Config{
			ServerName:         strings.Split(addr, ":")[0],
			InsecureSkipVerify: false,
		}
		if err = client.StartTLS(tlsConfig); err != nil {
			// log.Printf("❌ STARTTLS failed: %v", err)
			return fmt.Errorf("STARTTLS failed: %v", err)
		}
		// log.Printf("✅ TLS connection established")
	} else {
		// log.Printf("⚠️  STARTTLS not supported by server, continuing with plain connection")
	}
	
	// Check for AUTH support and authenticate if available
	if ok, mechanisms := client.Extension("AUTH"); ok {
		// Suppress unused variable warning
		_ = mechanisms
		// log.Printf("🔑 AUTH extension supported with mechanisms: %s", mechanisms)
		
		// Use the provided credentials for authentication
		username := fromEmail
		
		// log.Printf("🔐 Attempting authentication for user: %s", username)
		// log.Printf("🔑 Password provided: %t", password != "")
		
		if password != "" {
			// Create auth mechanism - try PLAIN first as it's most common
			auth := smtp.PlainAuth("", username, password, strings.Split(addr, ":")[0])
			
			if err := client.Auth(auth); err != nil {
				// log.Printf("❌ Authentication failed: %v", err)
				return fmt.Errorf("SMTP authentication failed: %v", err)
			} else {
				// log.Printf("✅ Authentication successful")
			}
		} else {
			// log.Printf("⚠️  No password provided, skipping authentication")
			return fmt.Errorf("SMTP password is required for authentication")
		}
	} else {
		// log.Printf("ℹ️  AUTH extension not available, proceeding without authentication")
	}
	
	// Set sender
	// log.Printf("📤 Setting sender: %s", fromEmail)
	if err = client.Mail(fromEmail); err != nil {
		// log.Printf("❌ Failed to set sender: %v", err)
		return fmt.Errorf("failed to set sender: %v", err)
	}
	
	// Set recipient
	// log.Printf("📥 Setting recipient: %s", toEmail)
	if err = client.Rcpt(toEmail); err != nil {
		// log.Printf("❌ Failed to set recipient: %v", err)
		return fmt.Errorf("failed to set recipient: %v", err)
	}
	
	// Send message
	// log.Printf("📝 Sending message data...")
	w, err := client.Data()
	if err != nil {
		// log.Printf("❌ Failed to initiate data transfer: %v", err)
		return fmt.Errorf("failed to initiate data transfer: %v", err)
	}
	
	_, err = w.Write([]byte(message))
	if err != nil {
		// log.Printf("❌ Failed to write message data: %v", err)
		return fmt.Errorf("failed to write message data: %v", err)
	}
	
	err = w.Close()
	if err != nil {
		// log.Printf("❌ Failed to close data writer: %v", err)
		return fmt.Errorf("failed to close data writer: %v", err)
	}
	
	// Quit gracefully
	err = client.Quit()
	if err != nil {
		// log.Printf("⚠️  Warning during QUIT: %v", err)
		// Don't return error for QUIT issues as email might have been sent
	}
	
	// log.Printf("✅ Email sent successfully via STARTTLS")
	return nil
}

// sendWithSSLAuth sends email with SSL/TLS and authentication (for port 465)
func (es *EmailService) sendWithSSLAuth(addr, hostname, fromEmail, toEmail, password, message string) error {
	// log.Printf("🔒 Establishing SSL/TLS connection to %s", addr)
	
	// Create TLS configuration
	tlsConfig := &tls.Config{
		InsecureSkipVerify: false,
		ServerName:         strings.Split(addr, ":")[0],
	}
	
	// Connect with TLS
	conn, err := tls.Dial("tcp", addr, tlsConfig)
	if err != nil {
		// log.Printf("❌ Failed to establish TLS connection: %v", err)
		return fmt.Errorf("failed to establish TLS connection: %v", err)
	}
	defer conn.Close()
	
	// Create SMTP client
	client, err := smtp.NewClient(conn, strings.Split(addr, ":")[0])
	if err != nil {
		// log.Printf("❌ Failed to create SMTP client: %v", err)
		return fmt.Errorf("failed to create SMTP client: %v", err)
	}
	defer client.Quit()
	
	// Send EHLO with proper hostname
	// log.Printf("👋 Sending EHLO with hostname: %s", hostname)
	if err = client.Hello(hostname); err != nil {
		// log.Printf("❌ EHLO failed: %v", err)
		return fmt.Errorf("EHLO failed: %v", err)
	}
	
	// Authenticate if AUTH is supported and password is provided
	if ok, mechanisms := client.Extension("AUTH"); ok {
		// Suppress unused variable warning
		_ = mechanisms
		// log.Printf("🔑 AUTH extension supported with mechanisms: %s", mechanisms)
		
		username := fromEmail
		
		// log.Printf("🔐 Attempting authentication for user: %s", username)
		// log.Printf("🔑 Password provided: %t", password != "")
		
		if password != "" {
			auth := smtp.PlainAuth("", username, password, strings.Split(addr, ":")[0])
			
			if err := client.Auth(auth); err != nil {
				// log.Printf("❌ Authentication failed: %v", err)
				return fmt.Errorf("SMTP authentication failed: %v", err)
			} else {
				// log.Printf("✅ Authentication successful")
			}
		} else {
			// log.Printf("⚠️  No password provided, skipping authentication")
			return fmt.Errorf("SMTP password is required for authentication")
		}
	}
	
	// Set sender and recipient
	// log.Printf("📤 Setting sender: %s", fromEmail)
	if err := client.Mail(fromEmail); err != nil {
		// log.Printf("❌ Failed to set sender: %v", err)
		return fmt.Errorf("failed to set sender: %v", err)
	}
	
	// log.Printf("📥 Setting recipient: %s", toEmail)
	if err := client.Rcpt(toEmail); err != nil {
		// log.Printf("❌ Failed to set recipient: %v", err)
		return fmt.Errorf("failed to set recipient: %v", err)
	}
	
	// Send message
	// log.Printf("📝 Sending message data...")
	w, err := client.Data()
	if err != nil {
		// log.Printf("❌ Failed to initiate data transfer: %v", err)
		return fmt.Errorf("failed to initiate data transfer: %v", err)
	}
	
	_, err = w.Write([]byte(message))
	if err != nil {
		// log.Printf("❌ Failed to write message data: %v", err)
		return fmt.Errorf("failed to write message data: %v", err)
	}
	
	err = w.Close()
	if err != nil {
		// log.Printf("❌ Failed to close data writer: %v", err)
		return fmt.Errorf("failed to close data writer: %v", err)
	}
	
	// log.Printf("✅ Email sent successfully via SSL/TLS")
	return nil
}