package sslmonitoring

import (
	"fmt"
	"strconv"
	"time"

	"service-operation/notification"
	"service-operation/pocketbase"
)

// SSLNotificationService handles SSL certificate notifications
type SSLNotificationService struct {
	client              *SSLClient
	pbClient           *pocketbase.PocketBaseClient
	notificationManager *notification.NotificationManager
	statusTracker      *SSLStatusTracker
}

// NewSSLNotificationService creates a new SSL notification service
func NewSSLNotificationService(client *SSLClient, pbClient *pocketbase.PocketBaseClient) *SSLNotificationService {
	return &SSLNotificationService{
		client:              client,
		pbClient:           pbClient,
		notificationManager: notification.NewNotificationManager(pbClient),
		statusTracker:      NewSSLStatusTracker(pbClient), // Pass pbClient to status tracker
	}
}

// CheckAndNotifySSLCertificate checks SSL certificate and sends notification if needed
func (sns *SSLNotificationService) CheckAndNotifySSLCertificate(cert SSLCertificate) error {
	// Always recalculate days left from the actual expiry date to ensure accuracy
	actualDaysLeft := sns.calculateDaysLeft(cert.ValidTill)
	
	// Use the calculated value as it's more accurate
	cert.DaysLeft = actualDaysLeft

	// Determine current status based on thresholds with calculated days left
	currentStatus := sns.determineSSLStatus(cert.DaysLeft, cert.WarningThreshold, cert.ExpiryThreshold)

	// Check if notification should be sent
	if !sns.shouldSendNotification(cert.ID, currentStatus) {
		return nil
	}

	// Skip if no notification configuration
	if cert.NotificationID == "" {
		return nil
	}

	// Send notification
	err := sns.sendSSLNotification(cert, currentStatus)
	if err != nil {
		return err
	}

	// Update tracking in database
	sns.statusTracker.UpdateStatus(cert.ID, currentStatus)
	sns.statusTracker.SetLastNotificationTime(cert.ID, time.Now())

	return nil
}

// calculateDaysLeft calculates days remaining until expiration with better error handling
func (sns *SSLNotificationService) calculateDaysLeft(validTill string) int {
	// Try multiple date formats to parse the expiry date
	var expiryTime time.Time
	var err error
	
	// Common date formats - updated to handle PocketBase format correctly
	formats := []string{
		"2006-01-02 15:04:05.000Z",       // PocketBase format with space (most common)
		"2006-01-02T15:04:05.000Z",       // ISO 8601 with milliseconds
		time.RFC3339,                     // Standard RFC3339
		time.RFC3339Nano,                 // RFC3339 with nanoseconds
		"2006-01-02 15:04:05Z",           // Without milliseconds
		"2006-01-02T15:04:05Z",           // ISO without milliseconds
		"2006-01-02 15:04:05.999Z",       // Alternative milliseconds format
		"2006-01-02T15:04:05.999Z",       // Alternative ISO milliseconds
		"2006-01-02 15:04:05.000000Z",    // Microseconds format
		"2006-01-02T15:04:05.000000Z",    // ISO microseconds format
		"2006-01-02 15:04:05",            // Simple format without timezone
		"2006-01-02",                     // Date only
	}
	
	for _, format := range formats {
		expiryTime, err = time.Parse(format, validTill)
		if err == nil {
			break
		}
	}
	
	if err != nil {
		return 0
	}
	
	now := time.Now()
	duration := expiryTime.Sub(now)
	daysLeft := int(duration.Hours() / 24)
	
	// If the result is negative, the certificate is expired
	if daysLeft < 0 {
		daysLeft = 0
	}
	
	return daysLeft
}

// sendSSLNotification sends the actual notification
func (sns *SSLNotificationService) sendSSLNotification(cert SSLCertificate, status string) error {
	// Determine the correct issuer value - prioritize IssuerCN over IssuerO
	issuerValue := ""
	if cert.IssuerCN != "" {
		issuerValue = cert.IssuerCN
	} else if cert.IssuerO != "" {
		issuerValue = cert.IssuerO
	} else {
		issuerValue = "Unknown"
	}
	
	// Create notification payload with SSL-specific data using calculated values
	payload := &notification.NotificationPayload{
		ServiceName:     fmt.Sprintf("SSL Certificate - %s", cert.Domain),
		Status:          status,
		Host:            cert.Domain,
		Domain:          cert.Domain,
		ServiceType:     "ssl",
		Timestamp:       time.Now(),
		Message:         sns.generateStatusMessage(cert, status),
		
		// SSL-specific fields with calculated/corrected values
		CertificateName: cert.Domain,
		ExpiryDate:      cert.ValidTill,
		DaysLeft:        strconv.Itoa(cert.DaysLeft), // Use the calculated value
		IssuerCN:        issuerValue,
		SerialNumber:    cert.SerialNumber,
	}

	// Send SSL notification using the manager
	return sns.notificationManager.SendSSLNotification(payload, cert.NotificationID, cert.TemplateID)
}

// generateStatusMessage creates appropriate message based on certificate status using calculated days
func (sns *SSLNotificationService) generateStatusMessage(cert SSLCertificate, status string) string {
	switch status {
	case "expired":
		return fmt.Sprintf("SSL certificate for %s expired on %s", cert.Domain, cert.ValidTill)
	case "expiring_soon":
		return fmt.Sprintf("SSL certificate for %s expires in %d days on %s", cert.Domain, cert.DaysLeft, cert.ValidTill)
	case "warning":
		return fmt.Sprintf("SSL certificate for %s expires in %d days", cert.Domain, cert.DaysLeft)
	default:
		return fmt.Sprintf("SSL certificate for %s is valid (%d days remaining)", cert.Domain, cert.DaysLeft)
	}
}

// shouldSendNotification determines if notification should be sent with enhanced logic
func (sns *SSLNotificationService) shouldSendNotification(certID, currentStatus string) bool {
	lastStatus := sns.statusTracker.GetLastStatus(certID)
	lastNotified := sns.statusTracker.GetLastNotificationTime(certID)

	// Send if status changed or first check
	if lastStatus == "" || lastStatus != currentStatus {
		return true
	}

	// For critical statuses (expired/expiring_soon), resend after 24 hours
	if (currentStatus == "expired" || currentStatus == "expiring_soon") && 
		!lastNotified.IsZero() && time.Since(lastNotified) > 24*time.Hour {
		return true
	}

	// For warning status, resend after 7 days to avoid spam
	if currentStatus == "warning" && 
		!lastNotified.IsZero() && time.Since(lastNotified) > 7*24*time.Hour {
		return true
	}

	return false
}

// determineSSLStatus determines SSL certificate status based on days left and thresholds
func (sns *SSLNotificationService) determineSSLStatus(daysLeft, warningThreshold, expiryThreshold int) string {
	if daysLeft <= 0 {
		return "expired"
	} else if daysLeft <= expiryThreshold {
		return "expiring_soon"
	} else if daysLeft <= warningThreshold {
		return "warning"
	}
	return "valid"
}