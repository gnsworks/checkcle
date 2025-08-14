
package servermonitoring

import (
	"fmt"
	"strconv"
	"strings"
	"time"
)

// ThresholdAlert tracks alert state and retry count
type ThresholdAlert struct {
	IsActive     bool
	Threshold    int
	CurrentValue float64
	LastAlerted  time.Time
	RetryCount   int // Track how many times we've sent this alert
}

// ThresholdMonitor handles server threshold monitoring and alerting
type ThresholdMonitor struct {
	pbClient            *ServerPocketBaseClient
	notificationService *ServerNotificationService
	activeAlerts        map[string]*ThresholdAlert // serverID-metricType -> alert
}

// NewThresholdMonitor creates a new threshold monitor
func NewThresholdMonitor(pbClient *ServerPocketBaseClient, notificationService *ServerNotificationService) *ThresholdMonitor {
	return &ThresholdMonitor{
		pbClient:            pbClient,
		notificationService: notificationService,
		activeAlerts:        make(map[string]*ThresholdAlert),
	}
}

// CheckServerThresholds checks all thresholds for a server
func (tm *ThresholdMonitor) CheckServerThresholds(server Server, metrics []ParsedServerMetrics) {
	if server.ThresholdID == "" {
		// log.Printf("No threshold configuration for server %s", server.Name)
		return
	}

	// Get threshold configuration
	threshold, err := tm.pbClient.GetServerThreshold(server.ThresholdID)
	if err != nil {
		// log.Printf("❌ Failed to get threshold config for server %s: %v", server.Name, err)
		_ = err
		return
	}

	if threshold == nil {
		// log.Printf("No threshold configuration found for server %s", server.Name)
		return
	}

	if len(metrics) == 0 {
		// log.Printf("No metrics available for threshold checking on server %s", server.Name)
		return
	}

	latestMetric := metrics[0]
	// log.Printf("🎯 Checking thresholds for server %s with threshold config: %+v", server.Name, threshold)

	// Parse MaxRetries from string to int
	maxRetries, err := strconv.Atoi(server.MaxRetries)
	if err != nil {
		// log.Printf("Invalid max_retries value '%s' for server %s, using default 3", server.MaxRetries, server.Name)
		maxRetries = 3
	}

	// Check CPU threshold
	tm.checkCPUThreshold(server, latestMetric, threshold, maxRetries)

	// Check RAM threshold
	tm.checkRAMThreshold(server, latestMetric, threshold, maxRetries)

	// Check Disk threshold
	tm.checkDiskThreshold(server, latestMetric, threshold, maxRetries)
}

// checkCPUThreshold checks CPU usage against threshold
func (tm *ThresholdMonitor) checkCPUThreshold(server Server, metric ParsedServerMetrics, threshold *ServerThreshold, maxRetries int) {
	cpuThresholdValue, err := strconv.Atoi(threshold.CPUThreshold)
	if err != nil {
		// log.Printf("Invalid CPU threshold value '%s' for server %s", threshold.CPUThreshold, server.Name)
		return
	}

	// Parse CPU usage from metric (format: "XX.XX%")
	cpuUsageStr := strings.TrimSuffix(metric.CPUUsage, "%")
	cpuUsage, err := strconv.ParseFloat(cpuUsageStr, 64)
	if err != nil {
		// log.Printf("Failed to parse CPU usage '%s' for server %s", metric.CPUUsage, server.Name)
		return
	}

	alertKey := fmt.Sprintf("%s-cpu", server.ServerID)
	
	if cpuUsage > float64(cpuThresholdValue) {
		// Threshold exceeded
		if tm.shouldCreateAlert(alertKey, cpuUsage, float64(cpuThresholdValue), maxRetries) {
			// log.Printf("🚨 CPU threshold exceeded for server %s: %.2f%% > %d%% (retry %d/%d)", 
			//	server.Name, cpuUsage, cpuThresholdValue, tm.getRetryCount(alertKey)+1, maxRetries)
			
			message := fmt.Sprintf("🚨 CPU Alert: Server %s CPU usage is %.2f%% (threshold: %d%%)", 
				server.Name, cpuUsage, cpuThresholdValue)
			
			tm.sendThresholdAlert(server, "cpu", message, cpuUsage, float64(cpuThresholdValue), fmt.Sprintf("%.2f%%", cpuUsage), fmt.Sprintf("%d%%", cpuThresholdValue))
			tm.setAlert(alertKey, cpuUsage, float64(cpuThresholdValue))
		} else {
			// log.Printf("🔇 CPU threshold exceeded for server %s but max retries (%d) reached, skipping notification", server.Name, maxRetries)
		}
	} else {
		// Check if we need to send recovery notification
		if tm.shouldSendRecoveryAlert(alertKey) {
			// log.Printf("✅ CPU recovered for server %s: %.2f%% <= %d%%", server.Name, cpuUsage, cpuThresholdValue)
			
			message := fmt.Sprintf("✅ CPU Recovery: Server %s CPU usage is back to normal: %.2f%% (threshold: %d%%)", 
				server.Name, cpuUsage, cpuThresholdValue)
			
			tm.sendThresholdRecovery(server, "cpu", message, fmt.Sprintf("%.2f%%", cpuUsage), fmt.Sprintf("%d%%", cpuThresholdValue))
			tm.clearAlert(alertKey)
		}
	}
}

// checkRAMThreshold checks RAM usage against threshold
func (tm *ThresholdMonitor) checkRAMThreshold(server Server, metric ParsedServerMetrics, threshold *ServerThreshold, maxRetries int) {
	ramThresholdValue, err := strconv.Atoi(threshold.RAMThreshold)
	if err != nil {
		// log.Printf("Invalid RAM threshold value '%s' for server %s", threshold.RAMThreshold, server.Name)
		return
	}

	// Parse RAM usage from metric (format: "X.XX GB (XX.X%)")
	ramUsageStr := metric.RAMUsed
	if strings.Contains(ramUsageStr, "(") && strings.Contains(ramUsageStr, "%)") {
		// Extract percentage from parentheses
		start := strings.Index(ramUsageStr, "(") + 1
		end := strings.Index(ramUsageStr, "%)")
		if start < end {
			ramPercentageStr := ramUsageStr[start:end]
			ramUsage, err := strconv.ParseFloat(ramPercentageStr, 64)
			if err != nil {
				// log.Printf("Failed to parse RAM usage percentage '%s' for server %s", ramPercentageStr, server.Name)
				return
			}

			alertKey := fmt.Sprintf("%s-ram", server.ServerID)
			
			if ramUsage > float64(ramThresholdValue) {
				// Threshold exceeded
				if tm.shouldCreateAlert(alertKey, ramUsage, float64(ramThresholdValue), maxRetries) {
					// log.Printf("🚨 RAM threshold exceeded for server %s: %.2f%% > %d%% (retry %d/%d)", 
					//	server.Name, ramUsage, ramThresholdValue, tm.getRetryCount(alertKey)+1, maxRetries)
					
					message := fmt.Sprintf("🚨 RAM Alert: Server %s RAM usage is %.2f%% (threshold: %d%%)", 
						server.Name, ramUsage, ramThresholdValue)
					
					tm.sendThresholdAlert(server, "ram", message, ramUsage, float64(ramThresholdValue), fmt.Sprintf("%.2f%%", ramUsage), fmt.Sprintf("%d%%", ramThresholdValue))
					tm.setAlert(alertKey, ramUsage, float64(ramThresholdValue))
				} else {
					// log.Printf("🔇 RAM threshold exceeded for server %s but max retries (%d) reached, skipping notification", server.Name, maxRetries)
				}
			} else {
				// Check if we need to send recovery notification
				if tm.shouldSendRecoveryAlert(alertKey) {
					// log.Printf("✅ RAM recovered for server %s: %.2f%% <= %d%%", server.Name, ramUsage, ramThresholdValue)
					
					message := fmt.Sprintf("✅ RAM Recovery: Server %s RAM usage is back to normal: %.2f%% (threshold: %d%%)", 
						server.Name, ramUsage, ramThresholdValue)
					
					tm.sendThresholdRecovery(server, "ram", message, fmt.Sprintf("%.2f%%", ramUsage), fmt.Sprintf("%d%%", ramThresholdValue))
					tm.clearAlert(alertKey)
				}
			}
		}
	}
}

// checkDiskThreshold checks disk usage against threshold
func (tm *ThresholdMonitor) checkDiskThreshold(server Server, metric ParsedServerMetrics, threshold *ServerThreshold, maxRetries int) {
	diskThresholdValue, err := strconv.Atoi(threshold.DiskThreshold)
	if err != nil {
		// log.Printf("Invalid disk threshold value '%s' for server %s", threshold.DiskThreshold, server.Name)
		return
	}

	// Parse disk usage from metric (format: "X.XX GB (XX.X%)")
	diskUsageStr := metric.DiskUsed
	if strings.Contains(diskUsageStr, "(") && strings.Contains(diskUsageStr, "%)") {
		// Extract percentage from parentheses
		start := strings.Index(diskUsageStr, "(") + 1
		end := strings.Index(diskUsageStr, "%)")
		if start < end {
			diskPercentageStr := diskUsageStr[start:end]
			diskUsage, err := strconv.ParseFloat(diskPercentageStr, 64)
			if err != nil {
				// log.Printf("Failed to parse disk usage percentage '%s' for server %s", diskPercentageStr, server.Name)
				return
			}

			alertKey := fmt.Sprintf("%s-disk", server.ServerID)
			
			if diskUsage > float64(diskThresholdValue) {
				// Threshold exceeded
				if tm.shouldCreateAlert(alertKey, diskUsage, float64(diskThresholdValue), maxRetries) {
					// log.Printf("🚨 Disk threshold exceeded for server %s: %.2f%% > %d%% (retry %d/%d)", 
					//	server.Name, diskUsage, diskThresholdValue, tm.getRetryCount(alertKey)+1, maxRetries)
					
					message := fmt.Sprintf("🚨 Disk Alert: Server %s disk usage is %.2f%% (threshold: %d%%)", 
						server.Name, diskUsage, diskThresholdValue)
					
					tm.sendThresholdAlert(server, "disk", message, diskUsage, float64(diskThresholdValue), fmt.Sprintf("%.2f%%", diskUsage), fmt.Sprintf("%d%%", diskThresholdValue))
					tm.setAlert(alertKey, diskUsage, float64(diskThresholdValue))
				} else {
					// log.Printf("🔇 Disk threshold exceeded for server %s but max retries (%d) reached, skipping notification", server.Name, maxRetries)
				}
			} else {
				// Check if we need to send recovery notification
				if tm.shouldSendRecoveryAlert(alertKey) {
					// log.Printf("✅ Disk recovered for server %s: %.2f%% <= %d%%", server.Name, diskUsage, diskThresholdValue)
					
					message := fmt.Sprintf("✅ Disk Recovery: Server %s disk usage is back to normal: %.2f%% (threshold: %d%%)", 
						server.Name, diskUsage, diskThresholdValue)
					
					tm.sendThresholdRecovery(server, "disk", message, fmt.Sprintf("%.2f%%", diskUsage), fmt.Sprintf("%d%%", diskThresholdValue))
					tm.clearAlert(alertKey)
				}
			}
		}
	}
}

// shouldCreateAlert determines if an alert should be created based on retry count and max retries
func (tm *ThresholdMonitor) shouldCreateAlert(alertKey string, currentValue, threshold float64, maxRetries int) bool {
	alert, exists := tm.activeAlerts[alertKey]
	if !exists {
		return true // No existing alert, create new one
	}
	
	// Check if we've reached max retries
	if alert.RetryCount >= maxRetries {
		// log.Printf("🔇 Alert %s has reached max retries (%d), not sending notification", alertKey, maxRetries)
		return false
	}
	
	// Check if enough time has passed since last alert (resend every 5 minutes)
	timeSinceLastAlert := time.Since(alert.LastAlerted)
	return timeSinceLastAlert > 5*time.Minute
}

// getRetryCount returns the current retry count for an alert
func (tm *ThresholdMonitor) getRetryCount(alertKey string) int {
	if alert, exists := tm.activeAlerts[alertKey]; exists {
		return alert.RetryCount
	}
	return 0
}

// shouldSendRecoveryAlert determines if a recovery alert should be sent
func (tm *ThresholdMonitor) shouldSendRecoveryAlert(alertKey string) bool {
	_, exists := tm.activeAlerts[alertKey]
	return exists // Send recovery only if there was an active alert
}

// setAlert creates or updates an alert with incremented retry count
func (tm *ThresholdMonitor) setAlert(alertKey string, currentValue, threshold float64) {
	alert, exists := tm.activeAlerts[alertKey]
	if exists {
		// Update existing alert and increment retry count
		alert.CurrentValue = currentValue
		alert.LastAlerted = time.Now()
		alert.RetryCount++
		// log.Printf("📊 Updated alert %s - Retry count: %d", alertKey, alert.RetryCount)
	} else {
		// Create new alert
		tm.activeAlerts[alertKey] = &ThresholdAlert{
			IsActive:     true,
			Threshold:    int(threshold),
			CurrentValue: currentValue,
			LastAlerted:  time.Now(),
			RetryCount:   1, // Start with 1 since we're sending the first notification
		}
		// log.Printf("🆕 Created new alert %s - Retry count: 1", alertKey)
	}
}

// clearAlert removes an alert
func (tm *ThresholdMonitor) clearAlert(alertKey string) {
	if _, exists := tm.activeAlerts[alertKey]; exists {
		// log.Printf("🗑️ Cleared alert %s", alertKey)
		delete(tm.activeAlerts, alertKey)
	}
}

// sendThresholdAlert sends a threshold exceeded notification using resource-specific templates
func (tm *ThresholdMonitor) sendThresholdAlert(server Server, metricType, message string, currentValue, threshold float64, usageStr, thresholdStr string) {
	if server.NotificationID == "" {
		// log.Printf("No notification ID configured for server %s", server.Name)
		return
	}

	// log.Printf("📤 Sending resource-specific threshold alert for server %s (%s): %s", server.Name, metricType, message)
	
	// Use the new resource-specific notification method with actual values
	err := tm.notificationService.SendResourceNotificationWithValues(server, "warning", message, metricType, usageStr, thresholdStr)
	if err != nil {
		// log.Printf("❌ Failed to send threshold alert for server %s: %v", server.Name, err)
		_ = err
	} else {
		// log.Printf("✅ Threshold alert sent successfully for server %s", server.Name)
	}
}

// sendThresholdRecovery sends a threshold recovery notification using resource-specific templates
func (tm *ThresholdMonitor) sendThresholdRecovery(server Server, metricType, message, usageStr, thresholdStr string) {
	if server.NotificationID == "" {
		// log.Printf("No notification ID configured for server %s", server.Name)
		return
	}

	// log.Printf("📤 Sending resource-specific threshold recovery for server %s (%s): %s", server.Name, metricType, message)
	
	// Use the new resource-specific notification method with actual values
	err := tm.notificationService.SendResourceNotificationWithValues(server, "up", message, metricType, usageStr, thresholdStr)
	if err != nil {
		// log.Printf("❌ Failed to send threshold recovery for server %s: %v", server.Name, err)
		_ = err
	} else {
		// log.Printf("✅ Threshold recovery sent successfully for server %s", server.Name)
	}
}