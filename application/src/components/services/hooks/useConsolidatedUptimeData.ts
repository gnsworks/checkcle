import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { uptimeService } from '@/services/uptimeService';
import { UptimeData } from '@/types/service.types';

interface UseConsolidatedUptimeDataProps {
  serviceId?: string;
  serviceType?: string;
  status: string;
  interval: number;
}

interface ConsolidatedTimeSlot {
  timestamp: string;
  items: Array<UptimeData & { source: string; isDefault: boolean }>;
}

// Helper function to safely check if a PocketBase field is actually undefined/null
const isFieldEmpty = (field: any): boolean => {
  if (field === undefined || field === null) return true;
  if (typeof field === 'object' && field._type === 'undefined') return true;
  if (typeof field === 'string' && (field === '' || field === 'undefined')) return true;
  return false;
};

// Helper function to safely get field value from PocketBase
const getFieldValue = (field: any): string | number | null => {
  if (isFieldEmpty(field)) return null;
  if (typeof field === 'object' && field.value !== undefined) return field.value;
  return field;
};

// Helper function to normalize timestamp to minute precision
const normalizeTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  // Round down to the nearest minute
  date.setSeconds(0, 0);
  return date.toISOString();
};

export const useConsolidatedUptimeData = ({ serviceId, serviceType, status, interval }: UseConsolidatedUptimeDataProps) => {
  const [consolidatedItems, setConsolidatedItems] = useState<ConsolidatedTimeSlot[]>([]);
  
  // Fetch ALL uptime history data in a single query
  const { data: uptimeData, isLoading, error, isFetching, refetch } = useQuery({
    queryKey: ['consolidatedUptimeHistory', serviceId, serviceType],
    queryFn: async () => {
      if (!serviceId) {
        console.log('No serviceId provided, skipping fetch');
        return [];
      }
      console.log(`Fetching consolidated uptime data for service ${serviceId} of type ${serviceType}`);
      
      // Get ALL uptime history data - this should include both default and regional data
      const rawData = await uptimeService.getUptimeHistory(serviceId, 100, undefined, undefined, serviceType);
      
      console.log(`Retrieved ${rawData.length} total records for service ${serviceId}`);
      console.log('Raw data sample:', rawData.slice(0, 5).map(d => ({
        timestamp: d.timestamp,
        region_name: d.region_name,
        agent_id: d.agent_id,
        status: d.status,
        service_id: d.service_id,
        response_time: d.responseTime
      })));
      
      return rawData;
    },
    enabled: !!serviceId,
    refetchInterval: 30000,
    staleTime: 15000,
    placeholderData: (previousData) => previousData,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
  
  // Process and consolidate uptime data
  const processConsolidatedData = (data: UptimeData[]): ConsolidatedTimeSlot[] => {
    if (!data || data.length === 0) return [];
    
    console.log(`Processing ${data.length} uptime records for consolidation`);
    
    // Create a map to group records by normalized timestamp (minute precision)
    const timeSlotMap = new Map<string, Array<UptimeData & { source: string; isDefault: boolean }>>();
    
    data.forEach(record => {
      // Normalize timestamp to minute precision to avoid duplicate bars
      const normalizedTimestamp = normalizeTimestamp(record.timestamp);
      
      // Safely extract region and agent information
      const regionName = getFieldValue(record.region_name);
      const agentId = getFieldValue(record.agent_id);
      
      // Determine the source name and whether it's default monitoring
      let sourceName: string;
      let isDefault: boolean;
      
      if (regionName && agentId) {
        // Regional monitoring data
        sourceName = `${regionName} (Agent ${agentId})`;
        isDefault = false;
        console.log(`Found regional data: ${sourceName} for normalized timestamp ${normalizedTimestamp}`);
      } else if (agentId && !regionName) {
        // Default monitoring with specific agent
        sourceName = `Default (Agent ${agentId})`;
        isDefault = true;
        console.log(`Found default monitoring: ${sourceName} for normalized timestamp ${normalizedTimestamp}`);
      } else {
        // Default monitoring fallback
        sourceName = 'Default System Check (Agent 1)';
        isDefault = true;
        console.log(`Using fallback default monitoring for normalized timestamp ${normalizedTimestamp}`);
      }
      
      // Get or create the array for this normalized timestamp
      if (!timeSlotMap.has(normalizedTimestamp)) {
        timeSlotMap.set(normalizedTimestamp, []);
      }
      
      // Check if we already have an entry from this source for this time slot
      const existingItems = timeSlotMap.get(normalizedTimestamp)!;
      const existingFromSource = existingItems.find(item => item.source === sourceName);
      
      if (!existingFromSource) {
        // Add the record with source information only if we don't already have one from this source
        timeSlotMap.get(normalizedTimestamp)!.push({
          ...record,
          timestamp: normalizedTimestamp, // Use normalized timestamp
          source: sourceName,
          isDefault
        });
        
        console.log(`Added record to normalized timestamp ${normalizedTimestamp}: Source=${sourceName}, Status=${record.status}, IsDefault=${isDefault}, ResponseTime=${record.responseTime}ms`);
      } else {
        console.log(`Skipping duplicate record for source ${sourceName} at timestamp ${normalizedTimestamp}`);
      }
    });
    
    // Convert map to consolidated time slots and sort by timestamp (newest first)
    const consolidatedTimeline: ConsolidatedTimeSlot[] = Array.from(timeSlotMap.entries())
      .map(([timestamp, items]) => ({
        timestamp,
        items: items.sort((a, b) => {
          // Sort so default monitoring appears first
          if (a.isDefault && !b.isDefault) return -1;
          if (!a.isDefault && b.isDefault) return 1;
          return 0;
        })
      }))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20); // Take the most recent 20 time slots
    
    console.log(`Created ${consolidatedTimeline.length} consolidated time slots with normalized timestamps`);
    consolidatedTimeline.forEach((slot, index) => {
      console.log(`Slot ${index} - Normalized Timestamp: ${slot.timestamp}, Items: ${slot.items.length}`);
      slot.items.forEach((item, itemIndex) => {
        console.log(`  Item ${itemIndex}: Source=${item.source}, Status=${item.status}, ResponseTime=${item.responseTime}ms, IsDefault=${item.isDefault}`);
      });
    });
    
    return consolidatedTimeline;
  };
  
  // Update consolidated items when data changes
  useEffect(() => {
    if (uptimeData && uptimeData.length > 0) {
      console.log(`Processing consolidated uptime data for service ${serviceId}`);
      const processedData = processConsolidatedData(uptimeData);
      
      // If service is currently paused, override ONLY the latest (first) bar with paused status
      if (status === "paused" && processedData.length > 0) {
        console.log(`Service ${serviceId} is paused, overriding latest bar with paused status`);
        
        // Create a paused entry for the latest timestamp
        const latestTimestamp = new Date();
        latestTimestamp.setSeconds(0, 0); // Normalize to minute precision
        
        const pausedSlot: ConsolidatedTimeSlot = {
          timestamp: latestTimestamp.toISOString(),
          items: [{
            id: `paused-${serviceId}-latest`,
            service_id: serviceId || "",
            serviceId: serviceId || "",
            timestamp: latestTimestamp.toISOString(),
            status: "paused" as "up" | "down" | "warning" | "paused",
            responseTime: 0,
            source: 'Default (Agent 1)',
            isDefault: true
          }]
        };
        
        // Replace the first item with paused status, keep the rest as historical data
        const updatedData = [pausedSlot, ...processedData.slice(0, 19)];
        console.log(`Updated data with paused latest bar, total bars: ${updatedData.length}`);
        setConsolidatedItems(updatedData);
      } else {
        // Service is active (up/down/warning) - merge real data with any existing paused bars
        console.log(`Service ${serviceId} is active with status: ${status}, merging with existing paused bars`);
        
        // Get existing paused bars from current state
        const existingPausedBars = consolidatedItems.filter(slot => 
          slot.items.some(item => item.status === "paused")
        );
        
        // Create a map of existing paused timestamps for quick lookup
        const pausedTimestamps = new Set(existingPausedBars.map(slot => slot.timestamp));
        
        // Merge processed data with existing paused bars
        const mergedData = [...processedData];
        
        // Add back any paused bars that don't conflict with new data
        existingPausedBars.forEach(pausedSlot => {
          const hasConflict = processedData.some(slot => slot.timestamp === pausedSlot.timestamp);
          if (!hasConflict) {
            mergedData.push(pausedSlot);
            console.log(`Preserved paused bar at timestamp: ${pausedSlot.timestamp}`);
          }
        });
        
        // Sort by timestamp (newest first) and limit to 20
        const finalData = mergedData
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 20);
        
        console.log(`Final merged data has ${finalData.length} slots`);
        setConsolidatedItems(finalData);
      }
    } else if (!serviceId || (uptimeData && uptimeData.length === 0)) {
      // Generate placeholder data when no real data is available
      console.log(`No uptime data available for service ${serviceId}, generating placeholder with status: ${status}`);
      
      // Use the actual service status for placeholder data
      const statusValue = status === "paused" ? "paused" : 
                         (status === "up" || status === "down" || status === "warning") ? status : "unknown";
        
      const placeholderHistory: ConsolidatedTimeSlot[] = Array(20).fill(null).map((_, index) => {
        const timestamp = new Date(Date.now() - (index * interval * 1000));
        timestamp.setSeconds(0, 0); // Normalize to minute precision
        
        return {
          timestamp: timestamp.toISOString(),
          items: [{
            id: `placeholder-${serviceId}-${index}`,
            service_id: serviceId || "",
            serviceId: serviceId || "",
            timestamp: timestamp.toISOString(),
            status: statusValue as "up" | "down" | "warning" | "paused",
            responseTime: statusValue === "paused" ? 0 : (statusValue === "up" ? 200 : 0),
            source: 'Default (Agent 1)',
            isDefault: true
          }]
        };
      });
      
      console.log(`Generated ${placeholderHistory.length} placeholder slots with status: ${statusValue}`);
      setConsolidatedItems(placeholderHistory);
    }
  }, [uptimeData, serviceId, status, interval, consolidatedItems]);

  return {
    consolidatedItems,
    isLoading,
    error,
    isFetching,
    refetch
  };
};