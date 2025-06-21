package savers

import (
	"fmt"
	"time"

	"service-operation/pocketbase"
	"service-operation/types"
)

type MetricsSaver struct {
	pbClient    *pocketbase.PocketBaseClient
	regionName  string
	agentID     string
}

func NewMetricsSaver(pbClient *pocketbase.PocketBaseClient) *MetricsSaver {
	return &MetricsSaver{
		pbClient:   pbClient,
		regionName: "Default", // Default fallback
		agentID:    "1",       // Default fallback
	}
}

func NewMetricsSaverWithRegion(pbClient *pocketbase.PocketBaseClient, regionName, agentID string) *MetricsSaver {
	return &MetricsSaver{
		pbClient:   pbClient,
		regionName: regionName,
		agentID:    agentID,
	}
}

func (ms *MetricsSaver) SaveMetricsToPocketBase(result *types.OperationResult, serviceID string) {
	// Save general metrics using the new structure
	metrics := pocketbase.MetricsRecord{
		ServiceName:  result.Host,
		Host:         result.Host,
		Uptime:       0, // This would need to be calculated based on your requirements
		ResponseTime: result.ResponseTime.Milliseconds(),
		LastChecked:  time.Now().Format(time.RFC3339),
		Port:         result.Port,
		ServiceType:  string(result.Type),
		Status:       GetStatusString(result.Success),
		ErrorMessage: result.Error,
		Details:      FormatResultDetails(result),
		CheckedAt:    time.Now().Format(time.RFC3339),
	}

	if err := ms.pbClient.SaveMetrics(metrics); err != nil {
		// Log error but don't fail the operation
		println("Failed to save metrics to PocketBase:", err.Error())
	}

	// Save detailed data based on operation type - only once per check
	if serviceID != "" {
		switch result.Type {
		case types.OperationPing:
			ms.SavePingDataToPocketBase(result, serviceID)
		case types.OperationHTTP:
			ms.SaveUptimeDataToPocketBase(result, serviceID)
		case types.OperationDNS:
			ms.SaveDNSDataToPocketBase(result, serviceID)
		case types.OperationTCP:
			ms.SaveTCPDataToPocketBase(result, serviceID)
		case types.OperationSSL:
			ms.SaveSSLDataToPocketBase(result, serviceID)
		}
	}
}

// Primary method for monitoring service usage - this prevents duplicates
func (ms *MetricsSaver) SaveMetricsForService(service pocketbase.Service, result *types.OperationResult) {
	// Save general metrics first - reduced logging
	metrics := pocketbase.MetricsRecord{
		ServiceName:  service.Name,
		Host:         service.Host,
		Uptime:       0, // This would need to be calculated based on your requirements
		ResponseTime: result.ResponseTime.Milliseconds(),
		LastChecked:  time.Now().Format(time.RFC3339),
		Port:         service.Port,
		ServiceType:  service.ServiceType,
		Status:       GetStatusString(result.Success),
		ErrorMessage: result.Error,
		Details:      FormatResultDetails(result),
		CheckedAt:    time.Now().Format(time.RFC3339),
	}

	if err := ms.pbClient.SaveMetrics(metrics); err != nil {
		// Silent error - no logging to reduce output
		return
	}

	// Save detailed data based on service type - only once per service with minimal logging
	switch service.ServiceType {
	case "ping", "icmp":
		ms.SavePingDataToPocketBase(result, service.ID)
	case "dns":
		ms.SaveDNSDataToPocketBase(result, service.ID)
	case "http", "https":
		ms.SaveUptimeDataToPocketBase(result, service.ID)
	case "tcp":
		ms.SaveTCPDataToPocketBase(result, service.ID)
	case "ssl":
		ms.SaveSSLDataToPocketBase(result, service.ID)
	}
}

// SSL Data saver - remains unchanged (no regional fields)
func (ms *MetricsSaver) SaveSSLDataToPocketBase(result *types.OperationResult, serviceID string) {
	// Create SSL data record without regional fields
	var details string
	
	if result.Success {
		details = fmt.Sprintf("✅ SSL Certificate Valid - Expires in %d days", result.SSLDaysLeft)
		details += fmt.Sprintf(" | Valid until: %s", result.SSLValidTill.Format("2006-01-02"))
		
		if result.SSLIssuer != "" {
			details += fmt.Sprintf(" | Issuer: %s", result.SSLIssuer)
		}
	} else {
		details = fmt.Sprintf("❌ SSL Certificate Issue - %s", GetShortErrorMessage(result.Error))
	}

	sslData := pocketbase.SSLDataRecord{
		ServiceID:     serviceID,
		Timestamp:     time.Now(),
		ResponseTime:  result.ResponseTime.Milliseconds(),
		Status:        GetStatusString(result.Success),
		ValidFrom:     result.SSLValidFrom.Format(time.RFC3339),
		ValidTill:     result.SSLValidTill.Format(time.RFC3339),
		DaysLeft:      result.SSLDaysLeft,
		Issuer:        result.SSLIssuer,
		Subject:       result.SSLSubject,
		SerialNumber:  result.SSLSerialNumber,
		Algorithm:     result.SSLAlgorithm,
		SANs:          result.SSLSANs,
		ResolvedIP:    result.SSLResolvedIP,
		ErrorMessage:  result.Error,
		Details:       details,
	}

	if err := ms.pbClient.SaveSSLData(sslData); err != nil {
		println("Failed to save SSL data to PocketBase:", err.Error())
	}
}