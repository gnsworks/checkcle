
package sslmonitoring

import (
	"encoding/json"
	"strconv"
	"time"
)

type SSLCertificate struct {
	ID                   string    `json:"id"`
	CollectionID         string    `json:"collectionId"`
	CollectionName       string    `json:"collectionName"`
	Domain               string    `json:"domain"`
	IssuerO              string    `json:"issuer_o"`
	Status               string    `json:"status"`
	LastNotified         string    `json:"last_notified"`
	WarningThreshold     int       `json:"warning_threshold"`
	ExpiryThreshold      int       `json:"expiry_threshold"`
	NotificationChannel  string    `json:"notification_channel"`
	NotificationID       string    `json:"notification_id"`
	TemplateID           string    `json:"template_id"`
	ValidFrom            string    `json:"valid_from"`
	SerialNumber         string    `json:"serial_number"`
	IssuedTo             string    `json:"issued_to"`
	ValidTill            string    `json:"valid_till"`
	ValidityDays         int       `json:"validity_days"`
	DaysLeft             int       `json:"days_left"`
	ValidDaysToExpire    int       `json:"valid_days_to_expire"`
	ResolvedIP           string    `json:"resolved_ip"`
	IssuerCN             string    `json:"issuer_cn"`
	CertAlg              string    `json:"cert_alg"`
	CertSans             string    `json:"cert_sans"`
	CheckInterval        int       `json:"check_interval"`
	CheckAt              string    `json:"check_at"`
	Created              string    `json:"created"`
	Updated              string    `json:"updated"`
}

// Custom unmarshaler to handle check_interval as both string and int, and serial_number as string
func (s *SSLCertificate) UnmarshalJSON(data []byte) error {
	// Create a temporary struct with flexible types
	type Alias SSLCertificate
	aux := &struct {
		CheckInterval interface{} `json:"check_interval"`
		SerialNumber  interface{} `json:"serial_number"`
		*Alias
	}{
		Alias: (*Alias)(s),
	}

	if err := json.Unmarshal(data, &aux); err != nil {
		return err
	}

	// Handle check_interval conversion
	switch v := aux.CheckInterval.(type) {
	case string:
		if v == "" {
			s.CheckInterval = 1440 // Default 24 hours in minutes
		} else {
			interval, err := strconv.Atoi(v)
			if err != nil {
				s.CheckInterval = 1440 // Default on error
			} else {
				s.CheckInterval = interval
			}
		}
	case float64:
		s.CheckInterval = int(v)
	case int:
		s.CheckInterval = v
	default:
		s.CheckInterval = 1440 // Default 24 hours in minutes
	}

	// Handle serial_number conversion to string
	switch v := aux.SerialNumber.(type) {
	case string:
		s.SerialNumber = v
	case float64:
		// Handle scientific notation by converting to string
		s.SerialNumber = strconv.FormatFloat(v, 'f', 0, 64)
	case int64:
		s.SerialNumber = strconv.FormatInt(v, 10)
	case int:
		s.SerialNumber = strconv.Itoa(v)
	default:
		s.SerialNumber = ""
	}

	return nil
}

type SSLCheckResult struct {
	Domain               string        `json:"domain"`
	Success              bool          `json:"success"`
	Error                string        `json:"error,omitempty"`
	ValidFrom            time.Time     `json:"valid_from"`
	ValidTill            time.Time     `json:"valid_till"`
	DaysLeft             int           `json:"days_left"`
	Issuer               string        `json:"issuer"`
	Subject              string        `json:"subject"`
	SerialNumber         string        `json:"serial_number"`
	Algorithm            string        `json:"algorithm"`
	SANs                 []string      `json:"sans"`
	ResponseTime         time.Duration `json:"response_time"`
	ResolvedIP           string        `json:"resolved_ip"`
	CheckedAt            time.Time     `json:"checked_at"`
}