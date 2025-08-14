
package notification

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"

	"service-operation/pocketbase"
)

// parseNotificationIDs parses comma-separated notification IDs
func parseNotificationIDs(notificationID string) []string {
	if notificationID == "" {
		return []string{}
	}
	
	// Split by comma and trim whitespace
	ids := strings.Split(notificationID, ",")
	var cleanIDs []string
	for _, id := range ids {
		cleanID := strings.TrimSpace(id)
		if cleanID != "" {
			cleanIDs = append(cleanIDs, cleanID)
		}
	}
	
	//log.Printf("📋 Parsed notification IDs: %v", cleanIDs)
	return cleanIDs
}

// isNotificationEnabled checks if the notification is enabled
func isNotificationEnabled(pbClient *pocketbase.PocketBaseClient, notificationID string) bool {
	config, err := getAlertConfiguration(pbClient, notificationID)
	if err != nil {
		//log.Printf("❌ Error getting alert configuration for enabled check: %v", err)
		return false
	}
	
	enabled, err := strconv.ParseBool(config.Enabled)
	if err != nil {
		//log.Printf("❌ Error parsing enabled field: %v", err)
		return false
	}
	
	//log.Printf("ℹ️  Notification %s enabled status: %t", notificationID, enabled)
	return enabled
}

// getAlertConfiguration fetches alert configuration from PocketBase
func getAlertConfiguration(pbClient *pocketbase.PocketBaseClient, notificationID string) (*AlertConfiguration, error) {
	url := fmt.Sprintf("%s/api/collections/alert_configurations/records/%s", pbClient.GetBaseURL(), notificationID)
	//log.Printf("🌐 Fetching alert configuration from: %s", url)
	
	resp, err := http.Get(url)
	if err != nil {
		//log.Printf("❌ HTTP error fetching alert configuration: %v", err)
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Printf("❌ Failed to fetch alert configuration, status: %d", resp.StatusCode)
		return nil, fmt.Errorf("failed to fetch alert configuration, status: %d", resp.StatusCode)
	}

	var config AlertConfiguration
	if err := json.NewDecoder(resp.Body).Decode(&config); err != nil {
		//log.Printf("❌ Error decoding alert configuration JSON: %v", err)
		return nil, err
	}

	//log.Printf("✅ Successfully fetched alert configuration: %+v", config)
	return &config, nil
}

// getNotificationTemplate fetches server notification template from PocketBase
func getNotificationTemplate(pbClient *pocketbase.PocketBaseClient, templateID string) (*ServerNotificationTemplate, error) {
	url := fmt.Sprintf("%s/api/collections/server_notification_templates/records/%s", pbClient.GetBaseURL(), templateID)
	//log.Printf("🌐 Fetching notification template from: %s", url)
	
	resp, err := http.Get(url)
	if err != nil {
		//log.Printf("❌ HTTP error fetching notification template: %v", err)
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Printf("❌ Failed to fetch notification template, status: %d", resp.StatusCode)
		return nil, fmt.Errorf("failed to fetch notification template, status: %d", resp.StatusCode)
	}

	var template ServerNotificationTemplate
	if err := json.NewDecoder(resp.Body).Decode(&template); err != nil {
		//log.Printf("❌ Error decoding notification template JSON: %v", err)
		return nil, err
	}

	//log.Printf("✅ Successfully fetched notification template: %+v", template)
	return &template, nil
}

// getServiceNotificationTemplate fetches service notification template from PocketBase
func getServiceNotificationTemplate(pbClient *pocketbase.PocketBaseClient, templateID string) (*ServiceNotificationTemplate, error) {
	url := fmt.Sprintf("%s/api/collections/service_notification_templates/records/%s", pbClient.GetBaseURL(), templateID)
	//log.Printf("🌐 Fetching service notification template from: %s", url)
	
	resp, err := http.Get(url)
	if err != nil {
		//log.Printf("❌ HTTP error fetching service notification template: %v", err)
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		//log.Printf("❌ Failed to fetch service notification template, status: %d", resp.StatusCode)
		return nil, fmt.Errorf("failed to fetch service notification template, status: %d", resp.StatusCode)
	}

	var template ServiceNotificationTemplate
	if err := json.NewDecoder(resp.Body).Decode(&template); err != nil {
		//log.Printf("❌ Error decoding service notification template JSON: %v", err)
		return nil, err
	}

	//log.Printf("✅ Successfully fetched service notification template: %+v", template)
	return &template, nil
}

// Helper function to get map keys
func getKeys(m map[string]NotificationService) []string {
	keys := make([]string, 0, len(m))
	for k := range m {
		keys = append(keys, k)
	}
	return keys
}