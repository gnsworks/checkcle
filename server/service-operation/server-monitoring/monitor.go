
package servermonitoring

import (
	"fmt"
	"strconv"
	"sync"
	"time"

	"service-operation/pocketbase"
)

// StatusAlert tracks alert state for server status changes
type StatusAlert struct {
	IsActive     bool
	Status       string
	LastAlerted  time.Time
	RetryCount   int
}

// ServerMonitor tracks server metrics and sends notifications
type ServerMonitor struct {
	pbClient            *ServerPocketBaseClient
	notificationService *ServerNotificationService
	thresholdMonitor    *ThresholdMonitor
	lastStatuses        map[string]string // Track last known status for each server
	activeStatusAlerts  map[string]*StatusAlert // Track status alerts with retry counts
	mu                  sync.RWMutex
	stopChan            chan bool
	isRunning           bool
}

// NewServerMonitor creates a new server monitor
func NewServerMonitor(pbClient *pocketbase.PocketBaseClient) *ServerMonitor {
	// log.Println("🔧 Creating new ServerMonitor instance")
	
	serverPBClient := NewServerPocketBaseClient(pbClient)
	notificationService := NewServerNotificationService(pbClient)
	thresholdMonitor := NewThresholdMonitor(serverPBClient, notificationService)
	
	return &ServerMonitor{
		pbClient:            serverPBClient,
		notificationService: notificationService,
		thresholdMonitor:    thresholdMonitor,
		lastStatuses:        make(map[string]string),
		activeStatusAlerts:  make(map[string]*StatusAlert),
		stopChan:            make(chan bool),
		isRunning:           false,
	}
}

// Start begins monitoring servers
func (sm *ServerMonitor) Start() {
	sm.mu.Lock()
	defer sm.mu.Unlock()

	if sm.isRunning {
		// log.Println("⚠️  Server monitor is already running")
		return
	}

	sm.isRunning = true
	// log.Println("🚀 Starting server monitoring service...")

	go sm.monitoringLoop()
}

// Stop stops monitoring servers
func (sm *ServerMonitor) Stop() {
	sm.mu.Lock()
	defer sm.mu.Unlock()

	if !sm.isRunning {
		// log.Println("⚠️  Server monitor is not running")
		return
	}

	// log.Println("🛑 Stopping server monitoring service...")
	sm.isRunning = false
	sm.stopChan <- true
}

// monitoringLoop runs the main monitoring loop
func (sm *ServerMonitor) monitoringLoop() {
	// log.Println("🔄 Starting monitoring loop with 30-second intervals")
	ticker := time.NewTicker(30 * time.Second) // Check every 30 seconds for more responsive monitoring
	defer ticker.Stop()

	// Initial check
	// log.Println("🔍 Performing initial server check...")
	sm.checkAllServers()

	for {
		select {
		case <-ticker.C:
			// log.Println("⏰ Timer triggered - checking all servers")
			sm.checkAllServers()
		case <-sm.stopChan:
			// log.Println("🛑 Stop signal received - exiting monitoring loop")
			return
		}
	}
}

// checkAllServers checks all servers for missing metrics
func (sm *ServerMonitor) checkAllServers() {
	// log.Println("📋 Fetching all servers from database...")
	
	servers, err := sm.pbClient.GetAllServers()
	if err != nil {
		// log.Printf("❌ CRITICAL ERROR: Failed to fetch servers: %v", err)
		_ = err
		return
	}

	// log.Printf("✅ Successfully fetched %d servers", len(servers))

	if len(servers) == 0 {
		// log.Println("⚠️  No servers found in database")
		return
	}

	for i, server := range servers {
		// log.Printf("🔍 [%d/%d] Processing server: %s (ID: %s)", i+1, len(servers), server.Name, server.ServerID)
		sm.checkServerMetrics(server)
		// log.Printf("✅ [%d/%d] Completed processing server: %s", i+1, len(servers), server.Name)
		_ = i
	}
	
	// log.Println("📋 Completed checking all servers")
}

// checkServerMetrics checks if a server has recent metrics and agent status
func (sm *ServerMonitor) checkServerMetrics(server Server) {
	// log.Printf("🔍 === DETAILED SERVER CHECK FOR: %s ===", server.Name)
	
	// Debug server fields BEFORE any operations
	sm.pbClient.DebugServerFields(server.ID, "BEFORE_CHECK")
	
	// log.Printf("📊 Server Details:")
	// log.Printf("  - ID: %s", server.ID)
	// log.Printf("  - Server ID: %s", server.ServerID)
	// log.Printf("  - Name: %s", server.Name)
	// log.Printf("  - Current Status: %s", server.Status)
	// log.Printf("  - Agent Status: %s", server.AgentStatus)
	// log.Printf("  - Check Interval: %d minutes", server.CheckInterval)
	// log.Printf("  - Notification ID: '%s'", server.NotificationID)
	// log.Printf("  - Template ID: '%s'", server.TemplateID)
	// log.Printf("  - Threshold ID: '%s'", server.ThresholdID)
	// log.Printf("  - IP Address: %s", server.IPAddress)
	// log.Printf("  - OS Type: %s", server.OSType)
	// log.Printf("  - Max Retries: %s", server.MaxRetries)

	// Track the notification configuration BEFORE any updates
	beforeNotificationID := server.NotificationID
	beforeTemplateID := server.TemplateID
	_ = beforeNotificationID
	_ = beforeTemplateID

	// Skip paused servers
	if server.Status == "paused" {
		// log.Printf("⏸️  Server %s is paused - skipping monitoring", server.Name)
		return
	}

	sm.mu.Lock()
	lastStatus := sm.lastStatuses[server.ServerID]
	sm.mu.Unlock()
	
	// log.Printf("📈 Status Tracking:")
	// log.Printf("  - Last Known Status: '%s'", lastStatus)
	// log.Printf("  - Current Database Status: '%s'", server.Status)

	currentStatus := "up"
	var message string
	var statusReason string

	// Check agent status first - if agent is stopped, server is definitely down
	if server.AgentStatus == "stopped" {
		currentStatus = "down"
		statusReason = "agent is stopped"
		message = fmt.Sprintf("🔴 Server %s is DOWN - Agent has stopped running", server.Name)
		// log.Printf("❌ SERVER DOWN DETECTED: %s - Agent is stopped", server.Name)
	} else if server.AgentStatus == "running" {
		// log.Printf("✅ Agent is running for server %s - checking metrics...", server.Name)
		
		// If agent is running, check metrics
		checkIntervalMinutes := time.Duration(server.CheckInterval) * time.Minute
		gracePeriod := 30 * time.Second
		metricsTimeout := checkIntervalMinutes + gracePeriod

		// Minimum timeout of 2 minutes to avoid false positives
		if metricsTimeout < 2*time.Minute {
			metricsTimeout = 2 * time.Minute
		}

		// log.Printf("🕐 Metrics Check Configuration:")
		// log.Printf("  - Check Interval: %v", checkIntervalMinutes)
		// log.Printf("  - Grace Period: %v", gracePeriod)
		// log.Printf("  - Total Timeout: %v", metricsTimeout)

		// Get recent metrics for this server
		// log.Printf("🔍 Fetching recent metrics for server %s...", server.Name)
		metrics, err := sm.pbClient.GetLatestServerMetrics(server.ServerID, metricsTimeout)
		if err != nil {
			// log.Printf("❌ ERROR: Failed to fetch metrics for server %s: %v", server.Name, err)
			_ = err
			return
		}

		// log.Printf("📊 Metrics Query Results:")
		// log.Printf("  - Found %d metrics within timeout period", len(metrics))
		
		if len(metrics) == 0 {
			// No recent metrics found - server is down
			currentStatus = "down"
			statusReason = fmt.Sprintf("no metrics received in last %v", metricsTimeout)
			message = fmt.Sprintf("🔴 Server %s is DOWN - No metrics received in the last %v (check interval: %d minutes)", 
				server.Name, metricsTimeout, server.CheckInterval)
			// log.Printf("❌ SERVER DOWN DETECTED: %s - No recent metrics", server.Name)
		} else {
			// Recent metrics found - server is up
			currentStatus = "up"
			latestMetric := metrics[0]
			age := time.Since(latestMetric.CreatedTime)
			statusReason = fmt.Sprintf("metrics received %v ago", age.Round(time.Second))
			message = fmt.Sprintf("✅ Server %s is operational - Latest metrics received %v ago (check interval: %d minutes)", 
				server.Name, age.Round(time.Second), server.CheckInterval)
			// log.Printf("✅ SERVER UP: %s - Latest metric %v ago", server.Name, age.Round(time.Second))
			
			// log.Printf("📊 Latest Metric Details:")
			// log.Printf("  - Metric ID: %s", latestMetric.ID)
			// log.Printf("  - Created: %v", latestMetric.CreatedTime)
			// log.Printf("  - Age: %v", age.Round(time.Second))
			// log.Printf("  - Status: %s", latestMetric.Status)

			// Check thresholds if server is up and has metrics
			// log.Printf("🎯 Checking thresholds for server %s...", server.Name)
			sm.thresholdMonitor.CheckServerThresholds(server, metrics)
		}
	} else {
		// log.Printf("⚠️  Unknown agent status '%s' for server %s", server.AgentStatus, server.Name)
		currentStatus = "up" // Default to up for unknown status
		statusReason = fmt.Sprintf("unknown agent status: %s", server.AgentStatus)
		message = fmt.Sprintf("⚠️  Server %s has unknown agent status: %s", server.Name, server.AgentStatus)
	}

	// log.Printf("📊 Status Determination:")
	// log.Printf("  - Determined Status: %s", currentStatus)
	// log.Printf("  - Reason: %s", statusReason)
	// log.Printf("  - Message: %s", message)

	// Check if status has changed
	statusChanged := lastStatus != currentStatus && lastStatus != ""
	isFirstCheck := lastStatus == ""
	_ = statusChanged
	_ = isFirstCheck

	// log.Printf("🔄 Status Change Analysis:")
	// log.Printf("  - Status Changed: %t", statusChanged)
	// log.Printf("  - First Check: %t", isFirstCheck)
	// log.Printf("  - Previous Status: '%s'", lastStatus)
	// log.Printf("  - New Status: '%s'", currentStatus)

	// Update last known status
	sm.mu.Lock()
	sm.lastStatuses[server.ServerID] = currentStatus
	sm.mu.Unlock()

	// Update server status in database if it changed
	if server.Status != currentStatus {
		// log.Printf("💾 === DATABASE UPDATE FOR: %s ===", server.Name)
		// log.Printf("  - BEFORE UPDATE:")
		// log.Printf("    * Status: %s → %s", server.Status, currentStatus)
		// log.Printf("    * Notification ID: '%s'", beforeNotificationID)
		// log.Printf("    * Template ID: '%s'", beforeTemplateID)
		
		// Log the update attempt
		LogServerUpdateAttempt(server.ID, "UpdateServerStatus", fmt.Sprintf("Status change from %s to %s", server.Status, currentStatus))
		
		// Debug fields before update
		sm.pbClient.DebugServerFields(server.ID, "BEFORE_UPDATE")
		
		if err := sm.pbClient.UpdateServerStatus(server.ID, currentStatus); err != nil {
			// log.Printf("❌ CRITICAL ERROR: Failed to update server status for %s: %v", server.Name, err)
			_ = err
		} else {
			// log.Printf("✅ Successfully updated database status for server %s", server.Name)
			
			// Debug fields after update
			sm.pbClient.DebugServerFields(server.ID, "AFTER_UPDATE")
		}
	} else {
		// log.Printf("ℹ️  Database status already matches current status (%s) for server %s", currentStatus, server.Name)
	}

	// Handle status notifications with retry logic
	sm.handleStatusNotifications(server, currentStatus, message, statusChanged, isFirstCheck)

	// Final status summary
	// log.Printf("📊 === FINAL STATUS SUMMARY FOR: %s ===", server.Name)
	// log.Printf("  - Final Status: %s (%s)", currentStatus, statusReason)
	// log.Printf("  - Database Updated: %t", server.Status != currentStatus)
	// log.Printf("  - Notification Config Preserved: ID='%s', Template='%s'", server.NotificationID, server.TemplateID)
	
	// Final debug after all operations
	sm.pbClient.DebugServerFields(server.ID, "FINAL_CHECK")
	
	// log.Printf("=== END SERVER CHECK FOR: %s ===\n", server.Name)
	_ = statusReason
}

// handleStatusNotifications handles sending notifications based on status changes and retry logic
func (sm *ServerMonitor) handleStatusNotifications(server Server, currentStatus, message string, statusChanged, isFirstCheck bool) {
	// log.Printf("📱 === NOTIFICATION ANALYSIS FOR: %s ===", server.Name)
	// log.Printf("🔧 Notification Configuration:")
	// log.Printf("  - Notification ID: '%s'", server.NotificationID)
	// log.Printf("  - Template ID: '%s'", server.TemplateID)
	// log.Printf("  - Has Notification Config: %t", server.NotificationID != "")
	// log.Printf("  - Max Retries: %s", server.MaxRetries)

	if server.NotificationID == "" {
		// log.Printf("🔕 NOTIFICATION SKIPPED: No notification ID configured for server %s", server.Name)
		return
	}

	// Parse max retries
	maxRetries, err := strconv.Atoi(server.MaxRetries)
	if err != nil {
		// log.Printf("Invalid max_retries value '%s' for server %s, using default 3", server.MaxRetries, server.Name)
		maxRetries = 3
	}

	// Determine if notification should be sent
	shouldSendNotification := false
	notificationReason := ""

	if currentStatus == "down" {
		if sm.shouldSendStatusAlert(server.ServerID, "down", maxRetries) {
			shouldSendNotification = true
			retryCount := sm.getStatusRetryCount(server.ServerID)
			notificationReason = fmt.Sprintf("server down - retry %d/%d", retryCount+1, maxRetries)
		} else {
			notificationReason = "server down but max retries reached"
		}
	} else if currentStatus == "up" && sm.shouldSendRecoveryStatusAlert(server.ServerID) {
		shouldSendNotification = true
		notificationReason = "server recovery notification"
	}

	// log.Printf("🎯 Notification Decision:")
	// log.Printf("  - Should Send: %t", shouldSendNotification)
	// log.Printf("  - Reason: %s", notificationReason)

	if shouldSendNotification {
		// log.Printf("📤 SENDING NOTIFICATION for server %s", server.Name)
		// log.Printf("📧 Notification Details:")
		// log.Printf("  - Server Name: %s", server.Name)
		// log.Printf("  - Status: %s", currentStatus)
		// log.Printf("  - Message: %s", message)
		// log.Printf("  - Notification ID: %s", server.NotificationID)
		// log.Printf("  - Template ID: %s", server.TemplateID)
		// log.Printf("  - Reason: %s", notificationReason)

		err := sm.notificationService.SendServerNotification(server, currentStatus, message)
		if err != nil {
			// log.Printf("❌ NOTIFICATION FAILED for server %s: %v", server.Name, err)
			_ = err
		} else {
			// log.Printf("✅ NOTIFICATION SENT SUCCESSFULLY for server %s", server.Name)
			
			// Update alert tracking based on status
			if currentStatus == "down" {
				sm.setStatusAlert(server.ServerID, "down")
			} else if currentStatus == "up" {
				sm.clearStatusAlert(server.ServerID)
			}
		}
	} else {
		// log.Printf("📱 NOTIFICATION SKIPPED for server %s: %s", server.Name, notificationReason)
	}

	_ = statusChanged
	_ = isFirstCheck
	_ = notificationReason
}

// shouldSendStatusAlert determines if a status alert should be sent based on retry count
func (sm *ServerMonitor) shouldSendStatusAlert(serverID, status string, maxRetries int) bool {
	sm.mu.RLock()
	alert, exists := sm.activeStatusAlerts[serverID]
	sm.mu.RUnlock()
	
	if !exists {
		return true // No existing alert, send new one
	}
	
	// Check if we've reached max retries
	if alert.RetryCount >= maxRetries {
		// log.Printf("🔇 Status alert for server %s has reached max retries (%d), not sending notification", serverID, maxRetries)
		return false
	}
	
	// Check if enough time has passed since last alert (resend every 5 minutes)
	timeSinceLastAlert := time.Since(alert.LastAlerted)
	return timeSinceLastAlert > 5*time.Minute
}

// getStatusRetryCount returns the current retry count for a status alert
func (sm *ServerMonitor) getStatusRetryCount(serverID string) int {
	sm.mu.RLock()
	defer sm.mu.RUnlock()
	
	if alert, exists := sm.activeStatusAlerts[serverID]; exists {
		return alert.RetryCount
	}
	return 0
}

// shouldSendRecoveryStatusAlert determines if a recovery alert should be sent
func (sm *ServerMonitor) shouldSendRecoveryStatusAlert(serverID string) bool {
	sm.mu.RLock()
	defer sm.mu.RUnlock()
	
	_, exists := sm.activeStatusAlerts[serverID]
	return exists // Send recovery only if there was an active alert
}

// setStatusAlert creates or updates a status alert with incremented retry count
func (sm *ServerMonitor) setStatusAlert(serverID, status string) {
	sm.mu.Lock()
	defer sm.mu.Unlock()
	
	alert, exists := sm.activeStatusAlerts[serverID]
	if exists {
		// Update existing alert and increment retry count
		alert.Status = status
		alert.LastAlerted = time.Now()
		alert.RetryCount++
		// log.Printf("📊 Updated status alert for server %s - Retry count: %d", serverID, alert.RetryCount)
	} else {
		// Create new alert
		sm.activeStatusAlerts[serverID] = &StatusAlert{
			IsActive:    true,
			Status:      status,
			LastAlerted: time.Now(),
			RetryCount:  1, // Start with 1 since we're sending the first notification
		}
		// log.Printf("🆕 Created new status alert for server %s - Retry count: 1", serverID)
	}
}

// clearStatusAlert removes a status alert
func (sm *ServerMonitor) clearStatusAlert(serverID string) {
	sm.mu.Lock()
	defer sm.mu.Unlock()
	
	if _, exists := sm.activeStatusAlerts[serverID]; exists {
		// log.Printf("🗑️ Cleared status alert for server %s", serverID)
		delete(sm.activeStatusAlerts, serverID)
	}
}