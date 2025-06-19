
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { uptimeService } from '@/services/uptimeService';
import { UptimeData } from '@/types/service.types';

interface UseUptimeDataProps {
  serviceId?: string;
  serviceType?: string;
  status: string;
  interval: number;
}

export const useUptimeData = ({ serviceId, serviceType, status, interval }: UseUptimeDataProps) => {
  const [historyItems, setHistoryItems] = useState<UptimeData[]>([]);
  
  // Fetch real uptime history data if serviceId is provided
  const { data: uptimeData, isLoading, error, isFetching, refetch } = useQuery({
    queryKey: ['uptimeHistory', serviceId, serviceType],
    queryFn: () => {
      if (!serviceId) {
        console.log('No serviceId provided, skipping fetch');
        return Promise.resolve([]);
      }
      console.log(`Fetching uptime data for service ${serviceId} of type ${serviceType}`);
      return uptimeService.getUptimeHistory(serviceId, 50, undefined, undefined, serviceType);
    },
    enabled: !!serviceId,
    refetchInterval: 30000,
    staleTime: 15000,
    placeholderData: (previousData) => previousData,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
  
  // Filter and process uptime data
  const processUptimeData = (data: UptimeData[], intervalSeconds: number): UptimeData[] => {
    if (!data || data.length === 0) return [];
    
    console.log(`Processing ${data.length} uptime records for service ${serviceId}`);
    
    // Sort data by timestamp (newest first)
    const sortedData = [...data].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    // Take the most recent 20 records to ensure we have enough data
    const recentData = sortedData.slice(0, 20);
    
    console.log(`Using ${recentData.length} most recent records`);
    
    return recentData;
  };
  
  // Update history items when data changes
  useEffect(() => {
    if (uptimeData && uptimeData.length > 0) {
      console.log(`Received ${uptimeData.length} uptime records for service ${serviceId}`);
      const processedData = processUptimeData(uptimeData, interval);
      setHistoryItems(processedData);
    } else if (!serviceId || (uptimeData && uptimeData.length === 0)) {
      // Generate placeholder data when no real data is available
      console.log(`No uptime data available for service ${serviceId}, generating placeholder`);
      
      const statusValue = (status === "up" || status === "down" || status === "warning" || status === "paused") 
        ? status 
        : "paused";
        
      const placeholderHistory: UptimeData[] = Array(20).fill(null).map((_, index) => ({
        id: `placeholder-${serviceId}-${index}`,
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
          serviceId: serviceId || "",
          timestamp: new Date(baseTime - timeOffset).toISOString(),
          status: lastStatus,
          responseTime: 0
        };
      });
      
      items.push(...paddingItems);
    }

    // Return exactly 20 items, sorted by timestamp (newest first)
    return items.slice(0, 20).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  };

  return {
    displayItems: getDisplayItems(),
    isLoading,
    error,
    isFetching,
    refetch
  };
};