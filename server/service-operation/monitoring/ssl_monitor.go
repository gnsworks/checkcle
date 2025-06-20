package monitoring

import (
	"fmt"
	"log"
	"time"

	"service-operation/operations"
	"service-operation/pocketbase"
	"service-operation/types"
)

type SSLMonitoringService struct {
	pbClient    *pocketbase.PocketBaseClient
	stopChan    chan bool
	retryQueue  map[string]int // Track retry count per certificate
	maxRetries  int
}

func NewSSLMonitoringService(pbClient *pocketbase.PocketBaseClient) *SSLMonitoringService {
	return &SSLMonitoringService{
		pbClient:   pbClient,
		stopChan:   make(chan bool),
		retryQueue: make(map[string]int),
		maxRetries: 3,
	}
}

func (s *SSLMonitoringService) Start() {
	ticker := time.NewTicker(1 * time.Minute) // Check every minute for scheduling
	defer ticker.Stop()

	log.Println("SSL monitoring service started with interval and check_at scheduling")

	for {
		select {
		case <-ticker.C:
			s.checkSSLCertificates()
		case <-s.stopChan:
			log.Println("SSL monitoring service stopped")
			return
		}
	}
}

func (s *SSLMonitoringService) Stop() {
	s.stopChan <- true
}

func (s *SSLMonitoringService) checkSSLCertificates() {
	//log.Println("Fetching SSL certificates from PocketBase...")
	
	certificates, err := s.pbClient.GetSSLCertificates()
	if err != nil {
		log.Printf("Failed to fetch SSL certificates: %v", err)
		return
	}

	//log.Printf("Found %d SSL certificates to check", len(certificates))

	for _, cert := range certificates {
		if s.shouldCheckCertificate(cert) {
			go s.checkSingleCertificateWithRetry(cert)
		}
	}
}

func (s *SSLMonitoringService) shouldCheckCertificate(cert types.SSLCertificate) bool {
	now := time.Now()
	
	// Priority 1: Check if check_at is set and is due
	if cert.CheckAt != "" {
		if checkAt, err := s.parseFlexibleTime(cert.CheckAt); err == nil {
			if now.After(checkAt) || now.Equal(checkAt) {
				log.Printf("Certificate %s is due for manual check (check_at: %s)", 
					cert.Domain, checkAt.Format("2006-01-02 15:04:05"))
				return true
			} else {
				//log.Printf("Certificate %s scheduled for later check (check_at: %s)", 
					//cert.Domain, checkAt.Format("2006-01-02 15:04:05"))
				//return false
			}
		} else {
			log.Printf("Error parsing check_at for %s: %v", cert.Domain, err)
		}
	}

	// Priority 2: Check based on check_interval (in days) from last update
	if cert.Updated == "" {
		log.Printf("Certificate %s has never been checked, scheduling check", cert.Domain)
		return true
	}

	// Parse last check time from updated field
	lastCheck, err := s.parseFlexibleTime(cert.Updated)
	if err != nil {
		log.Printf("Error parsing last check time for %s, scheduling check: %v", cert.Domain, err)
		return true
	}

	// Get check interval in days (default to 1 day if not set or invalid)
	checkIntervalDays := cert.CheckInterval
	if checkIntervalDays <= 0 {
		checkIntervalDays = 1 // Default to 1 day
	}

	// Adjust check interval based on certificate status for critical certificates
	adjustedIntervalDays := s.adjustCheckIntervalDays(cert, checkIntervalDays)

	// Calculate next check time based on days
	nextCheck := lastCheck.Add(time.Duration(adjustedIntervalDays) * 24 * time.Hour)
	shouldCheck := now.After(nextCheck)
	
	if shouldCheck {
		log.Printf("Certificate %s is due for interval check (last: %s, interval: %d days)", 
			cert.Domain, lastCheck.Format("2006-01-02 15:04:05"), adjustedIntervalDays)
	} else {
		//log.Printf("Certificate %s not due yet (next check: %s, interval: %d days)", 
			//cert.Domain, nextCheck.Format("2006-01-02 15:04:05"), adjustedIntervalDays)
	}
	
	return shouldCheck
}

// parseFlexibleTime tries multiple time formats to parse timestamps
func (s *SSLMonitoringService) parseFlexibleTime(timeStr string) (time.Time, error) {
	formats := []string{
		time.RFC3339,
		time.RFC3339Nano,
		"2006-01-02 15:04:05.999Z",       // ISO 8601 with milliseconds (PocketBase format)
		"2006-01-02 15:04:05.999999Z",    // ISO 8601 with microseconds
		"2006-01-02 15:04:05Z",           // ISO 8601 without milliseconds
		"2006-01-02T15:04:05.999Z",       // RFC3339 with milliseconds
		"2006-01-02T15:04:05.999999Z",    // RFC3339 with microseconds
		"2006-01-02T15:04:05Z",           // RFC3339 without milliseconds
		"2006-01-02 15:04:05.999999999 -0700 MST",
		"2006-01-02 15:04:05.999999 -0700 MST",
		"2006-01-02 15:04:05 -0700 MST",
		"2006-01-02 15:04:05.999999999",
		"2006-01-02 15:04:05.999999",
		"2006-01-02 15:04:05",
		"2006-01-02T15:04:05.999999999Z",
	}
	
	for _, format := range formats {
		if t, err := time.Parse(format, timeStr); err == nil {
			return t, nil
		}
	}
	
	return time.Time{}, fmt.Errorf("unable to parse time string: %s", timeStr)
}

// adjustCheckIntervalDays adjusts the check interval based on certificate status and days left
func (s *SSLMonitoringService) adjustCheckIntervalDays(cert types.SSLCertificate, defaultIntervalDays int) int {
	// Check more frequently for certificates that are expiring soon or have errors
	if cert.DaysLeft <= 7 {
		return 1 // Check daily for certificates expiring within 7 days
	} else if cert.DaysLeft <= 30 {
		// Check every 2 days for certificates expiring within 30 days
		if defaultIntervalDays > 2 {
			return 2
		}
	} else if cert.Status == "error" {
		return 1 // Check daily for certificates with errors
	}
	
	return defaultIntervalDays
}

func (s *SSLMonitoringService) checkSingleCertificateWithRetry(cert types.SSLCertificate) {
	retryCount := s.retryQueue[cert.ID]
	
	log.Printf("🔍 Checking SSL certificate for domain: %s (attempt %d/%d)", 
		cert.Domain, retryCount+1, s.maxRetries+1)
	
	result, err := s.performSSLCheck(cert.Domain)
	
	if err != nil && retryCount < s.maxRetries {
		// Increment retry count and schedule retry
		s.retryQueue[cert.ID] = retryCount + 1
		log.Printf("SSL check failed for %s, will retry (%d/%d): %v", 
			cert.Domain, retryCount+1, s.maxRetries, err)
		
		// Schedule retry with exponential backoff
		go func() {
			backoffDuration := time.Duration((retryCount + 1) * 30) * time.Second
			time.Sleep(backoffDuration)
			s.checkSingleCertificateWithRetry(cert)
		}()
		return
	}
	
	// Reset retry count on success or max retries reached
	delete(s.retryQueue, cert.ID)
	
	if err != nil {
		log.Printf("❌ SSL check failed for domain %s after %d attempts: %v", 
			cert.Domain, s.maxRetries+1, err)
		s.updateCertificateWithError(cert, err)
		return
	}

	// Update certificate with successful results
	s.updateCertificateWithResults(cert, result)
}

func (s *SSLMonitoringService) performSSLCheck(domain string) (*types.OperationResult, error) {
	log.Printf("Performing SSL check for domain: %s", domain)
	sslOp := operations.NewSSLOperation(30 * time.Second)
	result, err := sslOp.Execute(domain)
	
	if err != nil {
		log.Printf("SSL operation failed for %s: %v", domain, err)
		return nil, err
	}
	
	if result == nil {
		log.Printf("SSL operation returned nil result for %s", domain)
		return nil, fmt.Errorf("SSL check returned nil result")
	}
	
	log.Printf("SSL check completed for %s: success=%v, days_left=%d", 
		domain, result.Success, result.SSLDaysLeft)
	
	return result, nil
}

func (s *SSLMonitoringService) updateCertificateWithError(cert types.SSLCertificate, err error) {
	log.Printf("Updating certificate %s with error status", cert.Domain)
	
	updateData := map[string]interface{}{
		"status":       "error",
		"updated":      time.Now().Format(time.RFC3339),
		"error_message": err.Error(),
	}
	
	// Calculate next check time based on check_interval (in days) with shorter interval for errors
	checkIntervalDays := cert.CheckInterval
	if checkIntervalDays <= 0 {
		checkIntervalDays = 1
	}
	// For errors, check again in half the normal interval (minimum 1 day)
	errorIntervalDays := checkIntervalDays / 2
	if errorIntervalDays < 1 {
		errorIntervalDays = 1
	}
	
	nextCheck := time.Now().Add(time.Duration(errorIntervalDays) * 24 * time.Hour)
	updateData["check_at"] = nextCheck.Format(time.RFC3339)
	
	if updateErr := s.pbClient.UpdateSSLCertificate(cert.ID, updateData); updateErr != nil {
		log.Printf("Failed to update SSL certificate %s with error status: %v", cert.ID, updateErr)
	} else {
		log.Printf("📝 Updated certificate %s with error status (next check in %d days)", 
			cert.Domain, errorIntervalDays)
	}
}

func (s *SSLMonitoringService) updateCertificateWithResults(cert types.SSLCertificate, result *types.OperationResult) {
	status := getSSLStatus(result)
	
	log.Printf("Updating certificate %s with results: status=%s, days_left=%d, issuer=%s", 
		cert.Domain, status, result.SSLDaysLeft, result.SSLIssuer)
	
	updateData := map[string]interface{}{
		"status":                 status,
		"valid_from":            result.SSLValidFrom.Format(time.RFC3339),
		"valid_till":            result.SSLValidTill.Format(time.RFC3339),
		"days_left":             result.SSLDaysLeft,
		"valid_days_to_expire":  result.SSLDaysLeft,
		"resolved_ip":           result.SSLResolvedIP,
		"issuer_cn":             result.SSLIssuer,      // Now contains organization name like "Google Trust Services"
		"issued_to":             result.SSLSubject,     // Now contains organization name
		"serial_number":         result.SSLSerialNumber,
		"cert_alg":              result.SSLAlgorithm,
		"cert_sans":             result.SSLSANs,
		"updated":               time.Now().Format(time.RFC3339),
		"error_message":         "", // Clear any previous error
	}

	// Calculate next check time based on check_interval (in days) and certificate status
	checkIntervalDays := cert.CheckInterval
	if checkIntervalDays <= 0 {
		checkIntervalDays = 1 // Default to 1 day
	}
	
	adjustedIntervalDays := s.adjustCheckIntervalDays(cert, checkIntervalDays)
	nextCheck := time.Now().Add(time.Duration(adjustedIntervalDays) * 24 * time.Hour)
	updateData["check_at"] = nextCheck.Format(time.RFC3339)

	if err := s.pbClient.UpdateSSLCertificate(cert.ID, updateData); err != nil {
		log.Printf("Failed to update SSL certificate %s: %v", cert.ID, err)
	} else {
		log.Printf("✅ SSL certificate updated for %s: %s (%d days left, issuer: %s, next check in %d days)", 
			cert.Domain, status, result.SSLDaysLeft, result.SSLIssuer, adjustedIntervalDays)
	}
}

func getSSLStatus(result *types.OperationResult) string {
	if !result.Success {
		return "error"
	}
	
	if result.SSLDaysLeft <= 0 {
		return "expired"
	} else if result.SSLDaysLeft <= 7 {
		return "critical" // Very urgent
	} else if result.SSLDaysLeft <= 30 {
		return "expiring_soon"
	}
	
	return "valid"
}