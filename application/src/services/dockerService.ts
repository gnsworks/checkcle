
import { pb } from "@/lib/pocketbase";
import { DockerContainer, DockerMetrics, DockerStats } from "@/types/docker.types";

class DockerService {
  async getContainers(): Promise<DockerContainer[]> {
    try {
      console.log('Fetching all Docker containers...');
      const records = await pb.collection('dockers').getFullList({
        sort: '-created',
      });
      console.log('Docker containers fetched:', records);
      return records as DockerContainer[];
    } catch (error) {
      console.error('Error fetching Docker containers:', error);
      throw error;
    }
  }

  async getContainersByServerId(serverId: string): Promise<DockerContainer[]> {
    try {
      console.log('Fetching Docker containers for server ID:', serverId);
      
      // First, try to get the server details to find the correct hostname
      const server = await pb.collection('servers').getOne(serverId);
      console.log('Server details:', server);
      
      // Try multiple filter approaches to find containers
      const filters = [
        `server_id = "${serverId}"`,
        `hostname = "${server.hostname}"`,
        `hostname ~ "${server.hostname}"`,
        `ip_address = "${server.ip_address}"`,
      ];
      
      let containers: DockerContainer[] = [];
      
      for (const filter of filters) {
        console.log('Trying filter:', filter);
        try {
          const records = await pb.collection('dockers').getFullList({
            filter: filter,
            sort: '-created',
          });
          console.log(`Filter "${filter}" returned:`, records);
          
          if (records.length > 0) {
            containers = records as DockerContainer[];
            break;
          }
        } catch (filterError) {
          console.warn(`Filter "${filter}" failed:`, filterError);
          continue;
        }
      }
      
      // If no containers found with filters, get all and log for debugging
      if (containers.length === 0) {
        console.log('No containers found with filters, fetching all for debugging...');
        const allContainers = await pb.collection('dockers').getFullList({
          sort: '-created',
        });
        console.log('All available Docker containers:', allContainers);
        console.log('Looking for containers that might match server:', {
          serverId,
          serverHostname: server.hostname,
          serverIp: server.ip_address
        });
      }
      
      return containers;
    } catch (error) {
      console.error('Error fetching Docker containers by server ID:', error);
      throw error;
    }
  }

  async getContainerMetrics(dockerId: string): Promise<DockerMetrics[]> {
    try {
      console.log('Fetching metrics for docker ID:', dockerId);
      const records = await pb.collection('docker_metrics').getFullList({
        filter: `docker_id = "${dockerId}"`,
        sort: '-timestamp',
        perPage: 100,
      });
      console.log('Docker metrics fetched:', records);
      return records as DockerMetrics[];
    } catch (error) {
      console.error('Error fetching Docker metrics:', error);
      throw error;
    }
  }

  async getContainerStats(containers: DockerContainer[]): Promise<DockerStats> {
    const total = containers.length;
    
    // Parse status field to determine if container is running
    const running = containers.filter(c => {
      const status = c.status?.toLowerCase() || '';
      return status.includes('up') && !status.includes('exited');
    }).length;
    
    const stopped = containers.filter(c => {
      const status = c.status?.toLowerCase() || '';
      return status.includes('exited') || status.includes('stopped');
    }).length;
    
    const warning = containers.filter(c => {
      const status = c.status?.toLowerCase() || '';
      return status.includes('unhealthy') || status.includes('restarting');
    }).length;

    return {
      total,
      running,
      stopped,
      warning,
    };
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatUptime(uptime: string): string {
    return uptime || 'N/A';
  }

  parseMetricValue(value: string): number {
    if (!value || value === 'N/A') return 0;
    
    // Remove units and convert to number
    const numericValue = parseFloat(value.toString().replace(/[^\d.]/g, ''));
    return isNaN(numericValue) ? 0 : numericValue;
  }

  getStatusFromDockerStatus(status: string): 'running' | 'stopped' | 'warning' {
    const statusLower = status?.toLowerCase() || '';
    
    if (statusLower.includes('up') && !statusLower.includes('exited')) {
      return 'running';
    } else if (statusLower.includes('exited') || statusLower.includes('stopped')) {
      return 'stopped';
    } else {
      return 'warning';
    }
  }
}

export const dockerService = new DockerService();