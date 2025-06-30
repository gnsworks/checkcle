
import { pb } from '@/lib/pocketbase';
import { Server, ServerStats } from '@/types/server.types';

export const serverService = {
  async getServers(): Promise<Server[]> {
    try {
      const records = await pb.collection('servers').getFullList<Server>();
      return records;
    } catch (error) {
      console.error('Error fetching servers:', error);
      throw error;
    }
  },

  async getServer(serverId: string): Promise<Server> {
    try {
      const record = await pb.collection('servers').getOne<Server>(serverId);
      return record;
    } catch (error) {
      console.error('Error fetching server:', error);
      throw error;
    }
  },

  async getServerMetrics(serverId: string): Promise<any[]> {
    try {
      console.log('serverService.getServerMetrics: Fetching metrics for serverId:', serverId);
      
      // First, get the server to find the correct server_id for metrics
      let server;
      try {
        server = await this.getServer(serverId);
        console.log('serverService.getServerMetrics: Found server:', server);
      } catch (error) {
        console.log('serverService.getServerMetrics: Could not fetch server details:', error);
      }

      // Try to get metrics using the server's server_id field if available
      let metricsServerId = serverId;
      if (server && server.server_id) {
        metricsServerId = server.server_id;
        console.log('serverService.getServerMetrics: Using server.server_id for metrics:', metricsServerId);
      }

      // Try filtering by server_id first
      let filteredRecords = await pb.collection('server_metrics').getFullList({
        filter: `server_id = "${metricsServerId}"`,
        sort: '-created',
        requestKey: null
      });

      console.log('serverService.getServerMetrics: Filtered records by server_id:', filteredRecords.length);

      // If no records found with server_id, try alternative approaches
      if (filteredRecords.length === 0) {
        console.log('serverService.getServerMetrics: No records found with server_id filter, trying alternatives...');
        
        // Get all records to see what's available
        const allRecords = await pb.collection('server_metrics').getFullList({
          sort: '-created',
          requestKey: null
        });
        
        console.log('serverService.getServerMetrics: Total server_metrics records:', allRecords.length);
        if (allRecords.length > 0) {
          console.log('serverService.getServerMetrics: Sample record fields:', Object.keys(allRecords[0]));
          console.log('serverService.getServerMetrics: Sample server_id values:', allRecords.slice(0, 5).map(r => r.server_id));
        }

        // For now, return some sample data from available records if server matches pattern
        // This is temporary until the correct server_id mapping is established
        if (allRecords.length > 0) {
          console.log('serverService.getServerMetrics: Using available records as fallback');
          filteredRecords = allRecords.slice(0, 50); // Get recent 50 records
        }
      }
      
      console.log('serverService.getServerMetrics: Returning', filteredRecords.length, 'records');
      return filteredRecords;
    } catch (error) {
      console.error('Error fetching server metrics:', error);
      throw error;
    }
  },

  async getServerStats(servers: Server[]): Promise<ServerStats> {
    const total = servers.length;
    const online = servers.filter(server => server.status === 'up').length;
    const offline = servers.filter(server => server.status === 'down').length;
    const warning = servers.filter(server => server.status === 'warning').length;

    return {
      total,
      online,
      offline,
      warning
    };
  },

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  formatUptime(uptime: string): string {
    // Simple uptime formatting - can be enhanced based on actual format
    return uptime;
  }
};