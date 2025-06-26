
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { uptimeService } from '@/services/uptimeService';
import { UptimeData } from '@/types/service.types';

interface UseDefaultUptimeDataProps {
  serviceId?: string;
  serviceType?: string;
  status: string;
  interval: number;
}

export const useDefaultUptimeData = ({ serviceId, serviceType, status, interval }: UseDefaultUptimeDataProps) => {
  const [historyItems, setHistoryItems] = useState<UptimeData[]>([]);
  
  // Fetch ONLY Default (Agent ID 1) uptime history data - NO regional data whatsoever
  const { data: uptimeData, isLoading, error, isFetching, refetch } = useQuery({
    queryKey: ['strictDefaultUptimeHistory', serviceId, serviceType],
    queryFn: async () => {
      if (!serviceId) {
        console.log('No serviceId provided, skipping fetch');
        return [];
      }
      console.log(`Fetching STRICT Default (Agent ID 1) uptime data for service ${serviceId} of type ${serviceType}`);
      
      // Get raw uptime history data
      const rawData = await uptimeService.getUptimeHistory(serviceId, 50, undefined, undefined, serviceType);
      
      // ULTRA-STRICT filtering: ONLY Default monitoring records (Agent ID 1)
      // This means: NO region_name, NO agent_id, NO regional monitoring whatsoever
      const strictDefaultData = rawData.filter(record => {
        // Must have NO regional monitoring info at all
        const isStrictDefault = (
          !record.region_name && 
          !record.agent_id &&
          record.service_id === serviceId
        );
        
        if (isStrictDefault) {
          console.log(`✓ ACCEPTED Default record: ${record.id} - ${record.timestamp} - Pure default monitoring`);
        } else {
          console.log(`✗ REJECTED non-default record: ${record.id} - region: ${record.region_name || 'none'}, agent: ${record.agent_id || 'none'}`);
        }
        
        return isStrictDefault;
      });
      
      console.log(`ULTRA-STRICT FILTER: Reduced ${rawData.length} records to ${strictDefaultData.length} pure default monitoring records`);
      return strictDefaultData;
    },
    enabled: !!serviceId,
    refetchInterval: 30000,
    staleTime: 15000,
    placeholderData: (previousData) => previousData,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
  
  // Process uptime data with absolute timestamp uniqueness
  const processUptimeData = (data: UptimeData[], intervalSeconds: number): UptimeData[] => {
    if (!data || data.length === 0) return [];
    
    console.log(`Processing ${data.length} strict default monitoring records for service ${serviceId}`);
    
    // Sort data by timestamp (newest first)
    const sortedData = [...data].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    // ABSOLUTE timestamp uniqueness - use Map for O(1) lookup
    const timestampMap = new Map<string, UptimeData>();
    
    sortedData.forEach(record => {
      const exactTimestamp = record.timestamp;
      
      if (!timestampMap.has(exactTimestamp)) {
        timestampMap.set(exactTimestamp, record);
        console.log(`✓ Added unique default record: ${record.id} - ${exactTimestamp}`);
      } else {
        console.log(`✗ REJECTED absolute duplicate timestamp: ${record.id} - ${exactTimestamp} (exact timestamp match)`);
      }
    });
    
    // Convert Map back to array and take most recent 20
    const uniqueRecords = Array.from(timestampMap.values());
    const recentData = uniqueRecords.slice(0, 20);
    
    console.log(`FINAL RESULT: ${recentData.length} absolutely unique default monitoring records`);
    
    return recentData;
  };
  
  // Update history items when data changes
  useEffect(() => {
    if (uptimeData && uptimeData.length > 0) {
      console.log(`Received ${uptimeData.length} strict default monitoring records for service ${serviceId}`);
      const processedData = processUptimeData(uptimeData, interval);
      setHistoryItems(processedData);
    } else if (!serviceId || (uptimeData && uptimeData.length === 0)) {
      // Generate placeholder data when no real data is available
      console.log(`No strict default monitoring data available for service ${serviceId}, generating placeholder`);
      
      const statusValue = (status === "up" || status === "down" || status === "warning" || status === "paused") 
        ? status 
        : "paused";
        
      const placeholderHistory: UptimeData[] = Array(20).fill(null).map((_, index) => ({
        id: `placeholder-${serviceId}-${index}`,
        service_id: serviceId || "",
        serviceId: serviceId || "",
        timestamp: new Date(Date.now() - (index * interval * 1000)).toISOString(),
        status: statusValue as "up" | "down" | "warning" | "paused",
        responseTime: 0
      }));
      
      setHistoryItems(placeholderHistory);
    }
  }, [uptimeData, serviceId, status, interval]);

  // Ensure we always have exactly 20 items for consistent display
  const getDisplayItems = (): UptimeData[] => {
    const items = [...historyItems];
    
    // If we have fewer than 20 items, pad with older placeholder data
    if (items.length < 20) {
      const lastItem = items.length > 0 ? items[items.length - 1] : null;
      const lastStatus = lastItem ? lastItem.status : 
                        (status === "up" || status === "down" || status === "warning" || status === "paused") ? 
                        status as "up" | "down" | "warning" | "paused" : "paused";
      
      const paddingCount = 20 - items.length;
      const paddingItems: UptimeData[] = Array(paddingCount).fill(null).map((_, index) => {
        const baseTime = lastItem ? new Date(lastItem.timestamp).getTime() : Date.now();
        const timeOffset = (index + 1) * interval * 1000;
        
        return {
          id: `padding-${serviceId}-${index}`,
          service_id: serviceId || "",
          serviceId: serviceId || "",
          timestamp: new Date(baseTime - timeOffset).toISOString(),
          status: lastStatus,
          responseTime: 0
        };
      });
      
      items.push(...paddingItems);
    }

    // Final absolute validation - use Set for guaranteed uniqueness
    const finalItems = items.slice(0, 20);
    const seenTimestamps = new Set<string>();
    const absolutelyUniqueItems: UptimeData[] = [];
    
    finalItems.forEach(item => {
      if (!seenTimestamps.has(item.timestamp)) {
        seenTimestamps.add(item.timestamp);
        absolutelyUniqueItems.push(item);
      } else {
        console.log(`FINAL VALIDATION: Removing absolute duplicate timestamp ${item.timestamp} from display`);
      }
    });

    // Sort by timestamp (newest first) and ensure exactly 20 items
    const sortedValidated = absolutelyUniqueItems.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    console.log(`DISPLAY READY: ${sortedValidated.length} absolutely validated default monitoring items`);
    return sortedValidated.slice(0, 20);
  };

  return {
    displayItems: getDisplayItems(),
    isLoading,
    error,
    isFetching,
    refetch
  };
};