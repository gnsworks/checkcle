
export interface DockerContainer {
  collectionId: string;
  collectionName: string;
  id: string;
  docker_id: string;
  name: string;
  hostname: string;
  ip_address: string;
  os_template: string;
  uptime: string;
  ram_total: number;
  ram_used: number;
  cpu_cores: number;
  cpu_usage: number;
  disk_total: number;
  disk_used: number;
  last_checked: string;
  template_id: string;
  notification_id: string;
  timestamp: string;
  status: string;
  created: string;
  updated: string;
}

export interface DockerMetrics {
  collectionId: string;
  collectionName: string;
  id: string;
  docker_id: string;
  timestamp: string;
  ram_total: string;
  ram_used: string;
  ram_free: string;
  cpu_cores: string;
  cpu_usage: string;
  cpu_free: string;
  disk_total: string;
  disk_used: string;
  disk_free: string;
  status: string;
  network_rx_bytes: number;
  network_tx_bytes: number;
  network_rx_speed: number;
  network_tx_speed: number;
  created: string;
  updated: string;
}

export interface DockerStats {
  total: number;
  running: number;
  stopped: number;
  warning: number;
}