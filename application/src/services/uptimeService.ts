
import { pb } from '@/lib/pocketbase';
import { UptimeData } from '@/types/service.types';

const uptimeCache = new Map<string, {
  data: UptimeData[],
  timestamp: number,
  expiresIn: number
}>();

const CACHE_TTL = 3000; // 3 seconds for faster updates

// Map service types to their corresponding collections
const getCollectionForServiceType = (serviceType: string): string => {
  const type = serviceType.toLowerCase();
  switch (type) {
    case 'ping':
    case 'icmp':
      return 'ping_data';
    case 'dns':
      return 'dns_data';
    case 'tcp':
      return 'tcp_data';
    case 'http':
    case 'https':
    default:
      return 'uptime_data';
  }
};

export const uptimeService = {
  async recordUptimeData(data: UptimeData): Promise<void> {
    try {
      console.log(`Recording uptime data for service ${data.serviceId}: Status ${data.status}, Response time: ${data.responseTime}ms`);
      
      const options = {
        $autoCancel: false,
        $cancelKey: `uptime_record_${data.serviceId}_${Date.now()}`
      };
      
      const record = await pb.collection('uptime_data').create({
        service_id: data.serviceId,
        timestamp: data.timestamp,
        status: data.status,
        response_time: data.responseTime
      }, options);
      
      // Invalidate cache for this service
      const keysToDelete = Array.from(uptimeCache.keys()).filter(key => key.includes(`uptime_${data.serviceId}`));
      keysToDelete.forEach(key => uptimeCache.delete(key));
      
      console.log(`Uptime data recorded successfully with ID: ${record.id}`);
    } catch (error) {
      console.error("Error recording uptime data:", error);
      throw new Error(`Failed to record uptime data: ${error}`);
    }
  },
  
  async getUptimeHistory(
    serviceId: string, 
    limit: number = 200, 
    startDate?: Date, 
    endDate?: Date,
    serviceType?: string
  ): Promise<UptimeData[]> {
    try {
      if (!serviceId) {
        console.log('No serviceId provided to getUptimeHistory');
        return [];
      }

      const cacheKey = `uptime_${serviceId}_${limit}_${startDate?.toISOString() || ''}_${endDate?.toISOString() || ''}_${serviceType || 'default'}`;
      
      // Check cache
      const cached = uptimeCache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp) < cached.expiresIn) {
        console.log(`Using cached uptime history for service ${serviceId}`);
        return cached.data;
      }
      
      // Determine the correct collection based on service type
      const collection = serviceType ? getCollectionForServiceType(serviceType) : 'uptime_data';
      console.log(`Fetching uptime history for service ${serviceId} from collection ${collection}, limit: ${limit}`);
      
      // Build filter to get records for specific service_id
      let filter = `service_id='${serviceId}'`;
      
      // Add date range filtering if provided
      if (startDate && endDate) {
        const startUTC = startDate.toISOString();
        const endUTC = endDate.toISOString();
        
        console.log(`Date filter: ${startUTC} to ${endUTC}`);
        filter += ` && timestamp >= "${startUTC}" && timestamp <= "${endUTC}"`;
      }
      
      const options = {
        filter: filter,
        sort: '-timestamp', // Sort by timestamp descending (newest first)
        $autoCancel: false,
        $cancelKey: `uptime_history_${serviceId}_${Date.now()}`
      };
      
      console.log(`Filter query: ${filter} on collection: ${collection}`);
      
      const response = await pb.collection(collection).getList(1, limit, options);
      
      console.log(`Fetched ${response.items.length} uptime records for service ${serviceId} from ${collection}`);
      
      if (response.items.length > 0) {
        console.log(`Date range in results: ${response.items[response.items.length - 1].timestamp} to ${response.items[0].timestamp}`);
      } else {
        console.log(`No records found for service_id '${serviceId}' in collection: ${collection}`);
      }
      
      // Transform the response items to UptimeData format
      const uptimeData = response.items.map(item => ({
        id: item.id,
        serviceId: item.service_id,
        timestamp: item.timestamp,
        status: item.status as "up" | "down" | "warning" | "paused",
        responseTime: item.response_time || 0,
        date: item.timestamp,
        uptime: 100
      }));
      
      // Cache the result
      uptimeCache.set(cacheKey, {
        data: uptimeData,
        timestamp: Date.now(),
        expiresIn: CACHE_TTL
      });
      
      return uptimeData;
    } catch (error) {
      console.error(`Error fetching uptime history for service ${serviceId}:`, error);
      
      // Try to return cached data as fallback
      const cacheKey = `uptime_${serviceId}_${limit}_${startDate?.toISOString() || ''}_${endDate?.toISOString() || ''}_${serviceType || 'default'}`;
      const cached = uptimeCache.get(cacheKey);
      if (cached) {
        console.log(`Using expired cached data for service ${serviceId} due to fetch error`);
        return cached.data;
      }
      
      // Return empty array instead of throwing to prevent UI crashes
      console.log(`Returning empty array for service ${serviceId} due to fetch error`);
      return [];
    }
  }
};