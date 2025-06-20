
package operations

import (
	"crypto/x509/pkix"
	"fmt"
	"strings"
)

// normalizeDomain cleans and normalizes the domain input
func (op *SSLOperation) normalizeDomain(domain string) string {
	// Remove protocol prefixes
	domain = strings.Replace(domain, "https://", "", 1)
	domain = strings.Replace(domain, "http://", "", 1)
	
	// Remove trailing slash and path
	if idx := strings.Index(domain, "/"); idx != -1 {
		domain = domain[:idx]
	}
	
	// Trim whitespace
	domain = strings.TrimSpace(domain)
	
	return domain
}

// formatDistinguishedName formats the certificate distinguished name
func (op *SSLOperation) formatDistinguishedName(name pkix.Name) string {
	var parts []string
	
	if name.CommonName != "" {
		parts = append(parts, fmt.Sprintf("CN=%s", name.CommonName))
	}
	
	for _, org := range name.Organization {
		parts = append(parts, fmt.Sprintf("O=%s", org))
	}
	
	for _, orgUnit := range name.OrganizationalUnit {
		parts = append(parts, fmt.Sprintf("OU=%s", orgUnit))
	}
	
	for _, country := range name.Country {
		parts = append(parts, fmt.Sprintf("C=%s", country))
	}
	
	for _, locality := range name.Locality {
		parts = append(parts, fmt.Sprintf("L=%s", locality))
	}
	
	for _, province := range name.Province {
		parts = append(parts, fmt.Sprintf("ST=%s", province))
	}
	
	return strings.Join(parts, ", ")
}

// extractIssuerOrganization extracts only the organization (O=) from the issuer distinguished name
func (op *SSLOperation) extractIssuerOrganization(name pkix.Name) string {
	// Return the first organization if available
	if len(name.Organization) > 0 {
		return name.Organization[0]
	}
	
	// Fallback to Common Name if no organization
	if name.CommonName != "" {
		return name.CommonName
	}
	
	// Last resort fallback
	return "Unknown"
}

// extractSubjectOrganization extracts only the organization (O=) from the subject distinguished name
func (op *SSLOperation) extractSubjectOrganization(name pkix.Name) string {
	// Return the first organization if available
	if len(name.Organization) > 0 {
		return name.Organization[0]
	}
	
	// Fallback to Common Name if no organization
	if name.CommonName != "" {
		return name.CommonName
	}
	
	// Last resort fallback
	return "Unknown"
}