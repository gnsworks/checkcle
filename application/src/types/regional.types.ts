
export interface RegionalService {
  id: string;
  region_name: string;
  status: string;
  agent_id: string;
  agent_ip_address: string;
  token: string;
  connection: "online" | "offline";
  created: string;
  updated: string;
}

export interface CreateRegionalServiceParams {
  region_name: string;
  agent_ip_address: string;
}

export interface InstallCommand {
  token: string;
  agent_id: string;
  bash_script: string;
  api_endpoint: string;
}