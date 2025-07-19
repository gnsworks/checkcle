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

  async getServerMetrics(serverId: string, timeRange?: string): Promise<any[]> {
    try {
      console.log('🔍 serverService.getServerMetrics: Starting with serverId:', serverId, 'timeRange:', timeRange);
      
      // First, get the server to find the correct server_id for metrics
      let server;
      try {
        server = await this.getServer(serverId);
        console.log('✅ serverService.getServerMetrics: Found server:', {
          id: server.id,
          server_id: server.server_id,
          name: server.name
        });
      } catch (error) {
        console.log('❌ serverService.getServerMetrics: Could not fetch server details:', error);
      }

      // Let's first check what data exists in the database for this server
      console.log('🔍 Checking all records for this server...');
      const allServerRecords = await pb.collection('server_metrics').getFullList({
        filter: `server_id = "${serverId}" || server_id = "${server?.server_id}" || server_id = "${server?.id}"`,
        sort: '-created',
        requestKey: null
      });
      
      console.log('📊 Found total records for server:', allServerRecords.length);
      if (allServerRecords.length > 0) {
        console.log('📅 Date range of all records:', {
          newest: allServerRecords[0]?.created,
          oldest: allServerRecords[allServerRecords.length - 1]?.created
        });
        
        // Check last 5 records
        console.log('🔄 Last 5 records timestamps:', allServerRecords.slice(0, 5).map(r => ({
          created: r.created,
          age_minutes: Math.round((new Date().getTime() - new Date(r.created).getTime()) / (1000 * 60))
        })));
      }

      // Calculate time range for filtering
      const now = new Date();
      let cutoffTime;
      
      if (timeRange === '60m') {
        cutoffTime = new Date(now.getTime() - (60 * 60 * 1000)); // Exactly 60 minutes
        console.log('⏰ 60m filter: Looking for records newer than:', cutoffTime.toISOString());
        console.log('⏰ Current time:', now.toISOString());
        console.log('⏰ Time difference in minutes:', Math.round((now.getTime() - cutoffTime.getTime()) / (1000 * 60)));
      } else if (timeRange === '1d') {
        cutoffTime = new Date(now.getTime() - (24 * 60 * 60 * 1000));
      } else if (timeRange === '7d') {
        cutoffTime = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
      } else if (timeRange === '1m') {
        cutoffTime = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
      } else if (timeRange === '3m') {
        cutoffTime = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000));
      } else {
        cutoffTime = new Date(now.getTime() - (24 * 60 * 60 * 1000));
      }

      // Try to get filtered records
      const searchStrategies = [
        server?.server_id,
        serverId,
        server?.id
      ].filter(Boolean);

      let filteredRecords: any[] = [];

      for (const strategy of searchStrategies) {
        try {
          const cutoffISO = cutoffTime.toISOString();
          const filter = `server_id = "${strategy}" && created >= "${cutoffISO}"`;
          
          console.log(`🔍 Trying filter: ${filter}`);

          const records = await pb.collection('server_metrics').getFullList({
            filter: filter,
            sort: '-created',
            requestKey: null
          });

          console.log(`📊 Strategy "${strategy}" found ${records.length} records within time range`);

          if (records.length > 0) {
            filteredRecords = records;
            console.log('✅ Using records from strategy:', strategy);
            break;
          }
        } catch (error) {
          console.error(`❌ Error with strategy ${strategy}:`, error);
          continue;
        }
      }

      // If no filtered records found and it's 60m, let's see what we have in a larger window
      if (filteredRecords.length === 0 && timeRange === '60m') {
        console.log('⚠️ No records found in 60m window, checking last 24 hours...');
        
        const last24h = new Date(now.getTime() - (24 * 60 * 60 * 1000));
        
        for (const strategy of searchStrategies) {
          try {
            const filter = `server_id = "${strategy}" && created >= "${last24h.toISOString()}"`;
            
            const records = await pb.collection('server_metrics').getFullList({
              filter: filter,
              sort: '-created',
              requestKey: null
            });

            console.log(`📊 Last 24h check for "${strategy}": ${records.length} records`);
            
            if (records.length > 0) {
              console.log('📅 Sample record ages (minutes ago):', records.slice(0, 3).map(r => 
                Math.round((now.getTime() - new Date(r.created).getTime()) / (1000 * 60))
              ));
              
              // Return all recent records for 60m if we have any
              filteredRecords = records;
              break;
            }
          } catch (error) {
            console.error(`❌ Error with 24h fallback for ${strategy}:`, error);
            continue;
          }
        }
      }

      console.log('🎯 Final result:', filteredRecords.length, 'records found for', timeRange);
      if (filteredRecords.length > 0) {
        console.log('📅 Returned records age range (minutes ago):', {
          newest: Math.round((now.getTime() - new Date(filteredRecords[0].created).getTime()) / (1000 * 60)),
          oldest: Math.round((now.getTime() - new Date(filteredRecords[filteredRecords.length - 1].created).getTime()) / (1000 * 60))
        });
      }
      
      return filteredRecords;
    } catch (error) {
      console.error('❌ Error fetching server metrics:', error);
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