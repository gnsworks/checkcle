package operations

import (
	"crypto/x509"
	"fmt"
	"time"
)

// validateCertificate performs comprehensive certificate validation
func (op *SSLOperation) validateCertificate(cert *x509.Certificate, hostname string) error {
	now := time.Now()
	
	// Check if certificate is expired or not yet valid
	if now.Before(cert.NotBefore) {
		return fmt.Errorf("certificate is not yet valid (valid from: %v)", cert.NotBefore.Format("2006-01-02 15:04:05"))
	}
	if now.After(cert.NotAfter) {
		return fmt.Errorf("certificate has expired (expired on: %v)", cert.NotAfter.Format("2006-01-02 15:04:05"))
	}
	
	// Verify hostname matches certificate
	if err := cert.VerifyHostname(hostname); err != nil {
		return fmt.Errorf("hostname verification failed: %v", err)
	}
	
	// Check key usage - certificates should have digital signature capability
	if cert.KeyUsage&x509.KeyUsageDigitalSignature == 0 {
		return fmt.Errorf("certificate missing required digital signature key usage")
	}
	
	// Check if certificate is self-signed (basic check)
	if cert.Issuer.CommonName == cert.Subject.CommonName && len(cert.Subject.Organization) == 0 {
		return fmt.Errorf("certificate appears to be self-signed")
	}
	
	// Validate certificate chain if intermediate certificates are present
	if err := op.validateCertificateChain(cert); err != nil {
		return fmt.Errorf("certificate chain validation failed: %v", err)
	}
	
	return nil
}

// validateCertificateChain performs basic certificate chain validation
func (op *SSLOperation) validateCertificateChain(cert *x509.Certificate) error {
	// Check if the certificate has proper extensions for SSL/TLS
	hasServerAuth := false
	for _, usage := range cert.ExtKeyUsage {
		if usage == x509.ExtKeyUsageServerAuth {
			hasServerAuth = true
			break
		}
	}
	
	if !hasServerAuth {
		return fmt.Errorf("certificate does not have server authentication extension")
	}
	
	// Check certificate version (should be v3 for modern certificates)
	if cert.Version < 3 {
		return fmt.Errorf("certificate version %d is outdated (should be v3)", cert.Version)
	}
	
	return nil
}