
package operations

import (
	"crypto/tls"
	"fmt"
	"net"
	"strings"
	"time"

	"service-operation/types"
)

type SSLOperation struct {
	timeout time.Duration
}

func NewSSLOperation(timeout time.Duration) *SSLOperation {
	return &SSLOperation{
		timeout: timeout,
	}
}

func (op *SSLOperation) Execute(domain string) (*types.OperationResult, error) {
	startTime := time.Now()
	
	// Clean and normalize domain
	domain = op.normalizeDomain(domain)
	
	// Validate domain format
	if domain == "" {
		return op.createErrorResult(domain, startTime, "domain cannot be empty")
	}
	
	// Add port if not present
	host := domain
	if !strings.Contains(host, ":") {
		host = host + ":443"
	}

	// Set up TLS connection with timeout
	dialer := &net.Dialer{
		Timeout: op.timeout,
	}
	
	// Create TLS config with proper verification
	tlsConfig := &tls.Config{
		ServerName:         strings.Split(host, ":")[0],
		InsecureSkipVerify: false,
		MinVersion:         tls.VersionTLS12,
	}
	
	// Attempt TLS connection
	conn, err := tls.DialWithDialer(dialer, "tcp", host, tlsConfig)
	
	endTime := time.Now()
	responseTime := endTime.Sub(startTime)
	
	if err != nil {
		return &types.OperationResult{
			Type:         types.OperationSSL,
			Host:         strings.Split(host, ":")[0],
			Success:      false,
			ResponseTime: responseTime,
			Error:        fmt.Sprintf("TLS connection failed: %v", err),
			StartTime:    startTime,
			EndTime:      endTime,
		}, nil
	}
	defer conn.Close()

	// Get certificate chain information
	state := conn.ConnectionState()
	if len(state.PeerCertificates) == 0 {
		return &types.OperationResult{
			Type:         types.OperationSSL,
			Host:         strings.Split(host, ":")[0],
			Success:      false,
			ResponseTime: responseTime,
			Error:        "No certificates found in chain",
			StartTime:    startTime,
			EndTime:      endTime,
		}, nil
	}

	cert := state.PeerCertificates[0]
	hostname := strings.Split(host, ":")[0]
	
	// Perform comprehensive certificate validation
	validationError := op.validateCertificate(cert, hostname)
	
	// Calculate days left until expiration
	daysLeft := int(time.Until(cert.NotAfter).Hours() / 24)
	
	// Extract Subject Alternative Names
	sans := op.extractSANs(cert)
	
	// Get resolved IP address
	resolvedIP := op.getResolvedIP(hostname)
	
	// Extract certificate algorithm information
	algorithm := op.getCertificateAlgorithm(cert)
	
	// Extract issuer organization (O=) instead of full distinguished name
	issuerOrganization := op.extractIssuerOrganization(cert.Issuer)
	
	// Extract subject organization (O=) instead of full distinguished name
	subjectOrganization := op.extractSubjectOrganization(cert.Subject)
	
	// Check if certificate is valid (not expired and passes validation)
	isValid := validationError == nil && time.Now().Before(cert.NotAfter) && time.Now().After(cert.NotBefore)
	
	// Build detailed error message if validation failed
	errorMsg := ""
	if validationError != nil {
		errorMsg = validationError.Error()
	} else if time.Now().After(cert.NotAfter) {
		errorMsg = "Certificate has expired"
	} else if time.Now().Before(cert.NotBefore) {
		errorMsg = "Certificate is not yet valid"
	}

	// Create comprehensive result
	result := &types.OperationResult{
		Type:         types.OperationSSL,
		Host:         hostname,
		Success:      isValid,
		ResponseTime: responseTime,
		Error:        errorMsg,
		StartTime:    startTime,
		EndTime:      endTime,
		
		// SSL specific fields - using organization instead of full DN
		SSLValidFrom:     cert.NotBefore,
		SSLValidTill:     cert.NotAfter,
		SSLDaysLeft:      daysLeft,
		SSLIssuer:        issuerOrganization,        // Now shows "Google Trust Services" instead of full DN
		SSLSubject:       subjectOrganization,       // Now shows organization instead of full DN
		SSLSerialNumber:  cert.SerialNumber.String(),
		SSLAlgorithm:     algorithm,
		SSLSANs:          strings.Join(sans, ","),
		SSLResolvedIP:    resolvedIP,
	}

	return result, nil
}

// createErrorResult creates a standardized error result
func (op *SSLOperation) createErrorResult(domain string, startTime time.Time, errorMsg string) (*types.OperationResult, error) {
	return &types.OperationResult{
		Type:         types.OperationSSL,
		Host:         domain,
		Success:      false,
		ResponseTime: time.Since(startTime),
		Error:        errorMsg,
		StartTime:    startTime,
		EndTime:      time.Now(),
	}, nil
}