
package notification

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"
)

// DiscordService handles Discord notifications
type DiscordService struct{}

// NewDiscordService creates a new Discord notification service
func NewDiscordService() *DiscordService {
	return &DiscordService{}
}

// DiscordPayload represents the payload for Discord webhook
type DiscordPayload struct {
	Content string         `json:"content,omitempty"`
	Embeds  []DiscordEmbed `json:"embeds,omitempty"`
}

// DiscordEmbed represents a Discord embed
type DiscordEmbed struct {
	Title       string              `json:"title,omitempty"`
	Description string              `json:"description,omitempty"`
	Color       int                 `json:"color,omitempty"`
	Timestamp   string              `json:"timestamp,omitempty"`
	Fields      []DiscordEmbedField `json:"fields,omitempty"`
	Footer      *DiscordEmbedFooter `json:"footer,omitempty"`
}

// DiscordEmbedField represents a field in Discord embed
type DiscordEmbedField struct {
	Name   string `json:"name"`
	Value  string `json:"value"`
	Inline bool   `json:"inline,omitempty"`
}

// DiscordEmbedFooter represents footer in Discord embed
type DiscordEmbedFooter struct {
	Text string `json:"text"`
}

// SendNotification sends a notification via Discord webhook
func (ds *DiscordService) SendNotification(config *AlertConfiguration, message string) error {
	if config.DiscordWebhookURL == "" {
		return fmt.Errorf("discord webhook URL is required")
	}

	// Create rich embed for better formatting
	embed := ds.createDiscordEmbed(message)
	
	payload := DiscordPayload{
		Embeds: []DiscordEmbed{embed},
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal Discord payload: %v", err)
	}

	resp, err := http.Post(config.DiscordWebhookURL, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("discord webhook request failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("discord webhook error, status: %d", resp.StatusCode)
	}

	return nil
}

// createDiscordEmbed creates a formatted Discord embed from the message
func (ds *DiscordService) createDiscordEmbed(message string) DiscordEmbed {
	// Parse the message to extract structured information
	lines := strings.Split(message, "\n")
	
	if len(lines) == 0 {
		return DiscordEmbed{
			Description: message,
			Color:       ds.getDefaultColor(),
			Timestamp:   time.Now().Format(time.RFC3339),
		}
	}

	// Extract title from first line and determine status
	title := strings.TrimSpace(lines[0])
	color := ds.determineColorFromMessage(title)
	
	// Create fields from the remaining lines
	var fields []DiscordEmbedField
	
	for i, line := range lines {
		if i == 0 {
			continue // Skip title line
		}
		
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}
		
		// Parse field from "• Key: Value" format
		if strings.HasPrefix(line, "•") || strings.HasPrefix(line, "-") {
			line = strings.TrimPrefix(line, "•")
			line = strings.TrimPrefix(line, "-")
			line = strings.TrimSpace(line)
			
			parts := strings.SplitN(line, ":", 2)
			if len(parts) == 2 {
				fieldName := strings.TrimSpace(parts[0])
				fieldValue := strings.TrimSpace(parts[1])
				
				if fieldName != "" && fieldValue != "" {
					fields = append(fields, DiscordEmbedField{
						Name:   fieldName,
						Value:  fieldValue,
						Inline: true,
					})
				}
			} else {
				// If not in key:value format, add as description field
				fields = append(fields, DiscordEmbedField{
					Name:   "Details",
					Value:  line,
					Inline: false,
				})
			}
		}
	}
	
	// If no structured fields found, use the entire message as description
	if len(fields) == 0 {
		// Remove the first line from description since it's used as title
		description := ""
		if len(lines) > 1 {
			description = strings.Join(lines[1:], "\n")
		}
		
		return DiscordEmbed{
			Title:       title,
			Description: description,
			Color:       color,
			Timestamp:   time.Now().Format(time.RFC3339),
			Footer: &DiscordEmbedFooter{
				Text: "CheckCle System Alert",
			},
		}
	}

	return DiscordEmbed{
		Title:     title,
		Color:     color,
		Timestamp: time.Now().Format(time.RFC3339),
		Fields:    fields,
		Footer: &DiscordEmbedFooter{
			Text: "CheckCle System Alert",
		},
	}
}

// determineColorFromMessage determines Discord embed color based on message content
func (ds *DiscordService) determineColorFromMessage(message string) int {
	messageLower := strings.ToLower(message)
	
	// Red for critical/error states
	if strings.Contains(messageLower, "expired") || 
	   strings.Contains(messageLower, "down") || 
	   strings.Contains(messageLower, "failed") || 
	   strings.Contains(messageLower, "error") || 
	   strings.Contains(messageLower, "critical") ||
	   strings.Contains(messageLower, "🚨") ||
	   strings.Contains(messageLower, "🔴") {
		return 15158332 // Red (#E74C3C)
	}
	
	// Orange for warnings
	if strings.Contains(messageLower, "expiring_soon") || 
	   strings.Contains(messageLower, "expiring soon") || 
	   strings.Contains(messageLower, "warning") || 
	   strings.Contains(messageLower, "maintenance") || 
	   strings.Contains(messageLower, "paused") ||
	   strings.Contains(messageLower, "⚠️") ||
	   strings.Contains(messageLower, "🟡") ||
	   strings.Contains(messageLower, "🟠") {
		return 15105570 // Orange (#E67E22)
	}
	
	// Green for success/up states
	if strings.Contains(messageLower, "up") || 
	   strings.Contains(messageLower, "resolved") || 
	   strings.Contains(messageLower, "success") || 
	   strings.Contains(messageLower, "restored") || 
	   strings.Contains(messageLower, "valid") ||
	   strings.Contains(messageLower, "🟢") ||
	   strings.Contains(messageLower, "✅") {
		return 3066993 // Green (#2ECC71)
	}
	
	// Blue for info/default
	return 3447003 // Blue (#3498DB)
}

// getDefaultColor returns the default Discord embed color (blue)
func (ds *DiscordService) getDefaultColor() int {
	return 3447003 // Blue (#3498DB)
}