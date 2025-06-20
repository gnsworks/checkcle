
package operations

import (
	"crypto/ecdsa"
	"crypto/rsa"
	"crypto/x509"
	"fmt"
	"net"
)

// extractSANs extracts Subject Alternative Names from certificate
func (op *SSLOperation) extractSANs(cert *x509.Certificate) []string {
	sans := make([]string, 0)
	
	// Add DNS names
	sans = append(sans, cert.DNSNames...)
	
	// Add IP addresses
	for _, ip := range cert.IPAddresses {
		sans = append(sans, ip.String())
	}
	
	// Add email addresses
	sans = append(sans, cert.EmailAddresses...)
	
	// Add URIs
	for _, uri := range cert.URIs {
		sans = append(sans, uri.String())
	}
	
	return sans
}

// getResolvedIP resolves the domain to its IP address
func (op *SSLOperation) getResolvedIP(hostname string) string {
	ips, err := net.LookupIP(hostname)
	if err != nil || len(ips) == 0 {
		return ""
	}
	return ips[0].String()
}

// getCertificateAlgorithm returns detailed algorithm information
func (op *SSLOperation) getCertificateAlgorithm(cert *x509.Certificate) string {
	algorithm := cert.SignatureAlgorithm.String()
	
	// Add key size information if available
	switch pub := cert.PublicKey.(type) {
	case *rsa.PublicKey:
		algorithm += fmt.Sprintf(" (RSA %d-bit)", pub.N.BitLen())
	case *ecdsa.PublicKey:
		algorithm += fmt.Sprintf(" (ECDSA %d-bit)", pub.Curve.Params().BitSize)
	}
	
	return algorithm
}