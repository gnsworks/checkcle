
export interface Service {
  id: string;
  name: string;
  url: string;
  host?: string; // Add host field for PING and TCP services
  port?: number; // Add port field for TCP services
  type: "HTTP" | "HTTPS" | "TCP" | "DNS" | "PING" | "HTTP" | "http" | "https" | "tcp" | "dns" | "ping" | "smtp" | "icmp";
  status: "up" | "down" | "paused" | "pending" | "warning";
  responseTime: number;
  uptime: number;
  lastChecked: string;
  interval: number;
  retries: number;
  notificationChannel?: string;
  alertTemplate?: string;
  muteAlerts?: boolean; // Keep this to avoid breaking existing code
  alerts?: "muted" | "unmuted"; // Make sure alerts is properly typed as union
  muteChangedAt?: string;
  domain?: string; // Add domain field for DNS services
}

export interface CreateServiceParams {
  name: string;
  url?: string;
  host?: string; // Add host field for PING and TCP services
  port?: number; // Add port field for TCP services
  domain?: string; // Add domain field for DNS services
  type: string;
  interval: number;
  retries: number;
  notificationChannel?: string;
  alertTemplate?: string;
}

export interface UptimeData {
  date?: string;
  uptime?: number;
  id?: string;
  serviceId?: string;
  timestamp: string;
  status: "up" | "down" | "paused" | "pending" | "warning";
  responseTime: number;
}