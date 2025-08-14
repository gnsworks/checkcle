
package servermonitoring

// DebugServerFields helps debug server field preservation issues
func (c *ServerPocketBaseClient) DebugServerFields(serverID string, operation string) {
	// log.Printf("🔍 === DEBUG: %s for server %s ===", operation, serverID)
	
	servers, err := c.GetAllServers()
	if err != nil {
		// log.Printf("❌ Debug failed to fetch servers: %v", err)
		_ = err
		return
	}
	
	for _, server := range servers {
		if server.ID == serverID || server.ServerID == serverID {
			// log.Printf("📊 Server Debug Info:")
			// log.Printf("  - Server ID: %s", server.ID)
			// log.Printf("  - Server Name: %s", server.Name)
			// log.Printf("  - Status: %s", server.Status)
			// log.Printf("  - Notification ID: '%s'", server.NotificationID)
			// log.Printf("  - Template ID: '%s'", server.TemplateID)
			// log.Printf("  - Threshold ID: '%s'", server.ThresholdID)
			// log.Printf("  - Agent Status: %s", server.AgentStatus)
			// log.Printf("  - Check Interval: %d", server.CheckInterval)
			
			// Check for empty strings vs nil
			if server.NotificationID == "" {
				// log.Printf("⚠️  WARNING: Notification ID is empty string")
			}
			if server.TemplateID == "" {
				// log.Printf("⚠️  WARNING: Template ID is empty string")
			}
			if server.ThresholdID == "" {
				// log.Printf("⚠️  WARNING: Threshold ID is empty string")
			}
			
			_ = server
			break
		}
	}
	
	// log.Printf("🔍 === END DEBUG: %s ===", operation)
	_ = operation
	_ = serverID
}