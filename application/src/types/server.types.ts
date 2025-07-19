
export interface Server {
  collectionId: string;
  collectionName: string;
  id: string;
  server_id: string;
  name: string;
  hostname: string;
  ip_address: string;
  os_type: string;
  status: 'up' | 'down' | 'warning' | 'paused';
  uptime: string;
  ram_total: number;
  ram_used: number;
  cpu_cores: number;
  cpu_usage: number;
  disk_total: number;
  disk_used: number;
  last_checked: string;
  server_token: string;
  template_id: string;
  threshold_id: string;
  notification_id: string;
  timestamp: string;
  connection: string;
  agent_status: string;
  system_info: string;
  network_rx_bytes: string;
  network_tx_bytes: string;
  network_rx_speed: string;
  network_tx_speed: string;
  check_interval: number;
  docker: string;
  created: string;
  updated: string;
}

export interface ServerStats {
  total: number;
  online: number;
  offline: number;
  warning: number;
}