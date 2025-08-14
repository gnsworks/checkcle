
package uptimemonitoring

// UptimeService represents a service from PocketBase
type UptimeService struct {
	ID                 string `json:"id"`
	Name               string `json:"name"`
	Host               string `json:"host"`
	Uptime             int    `json:"uptime"`
	ResponseTime       int64  `json:"response_time"`
	LastChecked        string `json:"last_checked"`
	Port               int    `json:"port"`
	Domain             string `json:"domain"`
	HeartbeatInterval  int    `json:"heartbeat_interval"`
	MaxRetries         int    `json:"max_retries"`
	NotificationID     string `json:"notification_id"`
	TemplateID         string `json:"template_id"`
	ServiceType        string `json:"service_type"`
	Status             string `json:"status"`
	URL                string `json:"url"`
	Alerts             string `json:"alerts"`
	StatusCodes        string `json:"status_codes"`
	Keyword            string `json:"keyword"`
	RegionName         string `json:"region_name"`
	AgentID            string `json:"agent_id"`
	RegionalStatus     string `json:"regional_status"`
	NotificationStatus bool   `json:"notification_status"` // Changed from string to bool
	GroupID            string `json:"group_id"`
	WebhookID          string `json:"webhook_id"`
	Created            string `json:"created"`
	Updated            string `json:"updated"`
}

// UptimeServicesResponse represents the response from PocketBase services API
type UptimeServicesResponse struct {
	Page       int             `json:"page"`
	PerPage    int             `json:"perPage"`
	TotalItems int             `json:"totalItems"`
	TotalPages int             `json:"totalPages"`
	Items      []UptimeService `json:"items"`
}