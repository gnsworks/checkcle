
package servermonitoring

import "time"

// Server represents a server record in PocketBase
type Server struct {
	CollectionId       string  `json:"collectionId"`
	CollectionName     string  `json:"collectionName"`
	ID                 string  `json:"id"`
	ServerID           string  `json:"server_id"`
	Name               string  `json:"name"`
	Hostname           string  `json:"hostname"`
	IPAddress          string  `json:"ip_address"`
	OSType             string  `json:"os_type"`
	Status             string  `json:"status"` // 'up' | 'down' | 'warning' | 'paused'
	Uptime             string  `json:"uptime"`
	RAMTotal           float64 `json:"ram_total"`
	RAMUsed            float64 `json:"ram_used"`
	CPUCores           int     `json:"cpu_cores"`
	CPUUsage           float64 `json:"cpu_usage"`
	DiskTotal          float64 `json:"disk_total"`
	DiskUsed           float64 `json:"disk_used"`
	LastChecked        string  `json:"last_checked"`
	ServerToken        string  `json:"server_token"`
	TemplateID         string  `json:"template_id"`
	ThresholdID        string  `json:"threshold_id"`
	NotificationID     string  `json:"notification_id"`
	NotificationStatus bool    `json:"notification_status"`
	MaxRetries         string  `json:"max_retries"`
	Timestamp          string  `json:"timestamp"`
	Connection         string  `json:"connection"`
	AgentStatus        string  `json:"agent_status"`
	SystemInfo         string  `json:"system_info"`
	NetworkRxBytes     string  `json:"network_rx_bytes"`
	NetworkTxBytes     string  `json:"network_tx_bytes"`
	NetworkRxSpeed     string  `json:"network_rx_speed"`
	NetworkTxSpeed     string  `json:"network_tx_speed"`
	CheckInterval      int     `json:"check_interval"`
	Docker             string  `json:"docker"`
	Created            string  `json:"created"`
	Updated            string  `json:"updated"`
}

// ServerStats represents server statistics
type ServerStats struct {
	Total   int `json:"total"`
	Online  int `json:"online"`
	Offline int `json:"offline"`
	Warning int `json:"warning"`
}

// ServerThreshold represents threshold configuration for server monitoring
type ServerThreshold struct {
	ID                string `json:"id"`
	Name              string `json:"name"`
	CPUThreshold      string `json:"cpu_threshold"`
	RAMThreshold      string `json:"ram_threshold"`
	DiskThreshold     string `json:"disk_threshold"`
	NetworkThreshold  string `json:"network_threshold"`
	DiskIOThreshold   string `json:"disk_io_threshold"`
	CPUTempThreshold  string `json:"cpu_temp_threshold"`
	Created           string `json:"created"`
	Updated           string `json:"updated"`
}

// ServerNotificationPayload represents server-specific notification data
type ServerNotificationPayload struct {
	ServerName string    `json:"server_name"`
	ServerID   string    `json:"server_id"`
	Hostname   string    `json:"hostname"`
	IPAddress  string    `json:"ip_address"`
	Status     string    `json:"status"`
	OSType     string    `json:"os_type"`
	Timestamp  time.Time `json:"timestamp"`
	Message    string    `json:"message"`
}