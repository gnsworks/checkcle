import { pb } from '@/lib/pocketbase';
import { Server, ServerStats } from '@/types/server.types';

export const serverService = {
  async getServers(): Promise<Server[]> {
    try {
      const records = await pb.collection('servers').getFullList<Server>();
      return records;
    } catch (error) {
    //  console.error('Error fetching servers:', error);
      throw error;
    }
  },

  async getServer(serverId: string): Promise<Server> {
    try {
      const record = await pb.collection('servers').getOne<Server>(serverId);
      return record;
    } catch (error) {
    //  console.error('Error fetching server:', error);
      throw error;
    }
  },

  async getServerMetrics(serverId: string, timeRange?: string): Promise<any[]> {
    try {
    //  console.log('serverService.getServerMetrics: Fetching metrics for serverId:', serverId, 'timeRange:', timeRange);
      
      // First, get the server to find the correct server_id for metrics
      let server;
      try {
        server = await this.getServer(serverId);
     //   console.log('serverService.getServerMetrics: Found server:', server);
      } catch (error) {
     //   console.log('serverService.getServerMetrics: Could not fetch server details:', error);
      }

      // Try multiple filter strategies to find data
      let filter = '';
      let metricsServerId = serverId;
      
      // Strategy 1: Use server.server_id if available
      if (server && server.server_id) {
        metricsServerId = server.server_id;
        filter = `server_id = "${metricsServerId}"`;
     //   console.log('serverService.getServerMetrics: Strategy 1 - Using server.server_id for metrics:', metricsServerId);
      } else {
        // Strategy 2: Use the serverId directly
        filter = `server_id = "${serverId}"`;
     //   console.log('serverService.getServerMetrics: Strategy 2 - Using serverId directly for metrics:', serverId);
      }
      
      // Add agent_id filter if available in server data
      if (server && server.agent_id) {
        filter += ` && agent_id = "${server.agent_id}"`;
    //    console.log('serverService.getServerMetrics: Added agent_id filter:', server.agent_id);
      }

      // Add time range filter
      if (timeRange) {
        const now = new Date();
        let cutoffTime;
        
        switch (timeRange) {
          case '60m':
            cutoffTime = new Date(now.getTime() - (60 * 60 * 1000));
            break;
          case '1d':
            cutoffTime = new Date(now.getTime() - (24 * 60 * 60 * 1000));
            break;
          case '7d':
            cutoffTime = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
            break;
          case '1m':
            cutoffTime = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
            break;
          case '3m':
            cutoffTime = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000));
            break;
          default:
            cutoffTime = new Date(now.getTime() - (24 * 60 * 60 * 1000));
        }
        
        const cutoffISO = cutoffTime.toISOString();
        filter += ` && created >= "${cutoffISO}"`;
    //    console.log('serverService.getServerMetrics: Using time filter from:', cutoffISO, 'to now');
      }

    //  console.log('serverService.getServerMetrics: Final filter:', filter);

      // Fetch filtered records with proper sorting
      let records = await pb.collection('server_metrics').getFullList({
        filter: filter,
        sort: '-created',
        requestKey: null
      });

     // console.log('serverService.getServerMetrics: Found', records.length, 'records with primary filter');
      
      // If no records found with primary strategy, try fallback strategies
      if (records.length === 0) {
    //    console.log('serverService.getServerMetrics: No records found, trying fallback strategies...');
        
        // Fallback 1: Try without agent_id filter
        let fallbackFilter = `server_id = "${metricsServerId}"`;
        if (timeRange) {
          const now = new Date();
          let cutoffTime;
          
          switch (timeRange) {
            case '60m':
              cutoffTime = new Date(now.getTime() - (60 * 60 * 1000));
              break;
            case '1d':
              cutoffTime = new Date(now.getTime() - (24 * 60 * 60 * 1000));
              break;
            case '7d':
              cutoffTime = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
              break;
            case '1m':
              cutoffTime = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
              break;
            case '3m':
              cutoffTime = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000));
              break;
            default:
              cutoffTime = new Date(now.getTime() - (24 * 60 * 60 * 1000));
          }
          
          const cutoffISO = cutoffTime.toISOString();
          fallbackFilter += ` && created >= "${cutoffISO}"`;
        }
        
    //   console.log('serverService.getServerMetrics: Trying fallback filter without agent_id:', fallbackFilter);
        records = await pb.collection('server_metrics').getFullList({
          filter: fallbackFilter,
          sort: '-created',
          requestKey: null
        });
        
     //   console.log('serverService.getServerMetrics: Fallback found', records.length, 'records');
        
        // Fallback 2: Try with different server_id strategies
        if (records.length === 0) {
          const alternativeIds = [serverId, server?.server_id, server?.id].filter(Boolean);
      //    console.log('serverService.getServerMetrics: Trying alternative server IDs:', alternativeIds);
          
          for (const altId of alternativeIds) {
            if (altId && altId !== metricsServerId) {
              let altFilter = `server_id = "${altId}"`;
              if (timeRange) {
                const now = new Date();
                let cutoffTime;
                
                switch (timeRange) {
                  case '60m':
                    cutoffTime = new Date(now.getTime() - (60 * 60 * 1000));
                    break;
                  case '1d':
                    cutoffTime = new Date(now.getTime() - (24 * 60 * 60 * 1000));
                    break;
                  case '7d':
                    cutoffTime = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
                    break;
                  case '1m':
                    cutoffTime = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
                    break;
                  case '3m':
                    cutoffTime = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000));
                    break;
                  default:
                    cutoffTime = new Date(now.getTime() - (24 * 60 * 60 * 1000));
                }
                
                const cutoffISO = cutoffTime.toISOString();
                altFilter += ` && created >= "${cutoffISO}"`;
              }
              
          //    console.log('serverService.getServerMetrics: Trying alternative ID filter:', altFilter);
              const altRecords = await pb.collection('server_metrics').getFullList({
                filter: altFilter,
                sort: '-created',
                requestKey: null
              });
              
              if (altRecords.length > 0) {
          //      console.log('serverService.getServerMetrics: Alternative ID found', altRecords.length, 'records');
                records = altRecords;
                break;
              }
            }
          }
        }
      }

    //  console.log('serverService.getServerMetrics: Final result:', records.length, 'records found');
      if (records.length > 0) {
     //   console.log('serverService.getServerMetrics: Sample record:', records[0]);
      }
      
      return records;
    } catch (error) {
    //  console.error('Error fetching server metrics:', error);
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