
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
  
  // Fetch real uptime history data if serviceId is provided with improved caching and error handling
  const { data: uptimeData, isLoading, error, isFetching, refetch } = useQuery({
    queryKey: ['uptimeHistory', serviceId, serviceType],
    queryFn: () => serviceId ? uptimeService.getUptimeHistory(serviceId, 50, undefined, undefined, serviceType) : Promise.resolve([]),
    enabled: !!serviceId,
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 15000, // Consider data fresh for 15 seconds
    placeholderData: (previousData) => previousData, // Show previous data while refetching
    retry: 3, // Retry failed requests three times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Exponential backoff with max 10s
  });
  
  // Filter uptime data to respect the service interval
  const filterUptimeDataByInterval = (data: UptimeData[], intervalSeconds: number): UptimeData[] => {
    if (!data || data.length === 0) return [];
    
    // Sort data by timestamp (newest first)
    const sortedData = [...data].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    const filtered: UptimeData[] = [];
    let lastIncludedTime: number | null = null;
    const intervalMs = intervalSeconds * 1000; // Convert to milliseconds
    
    // Include the most recent record first
    if (sortedData.length > 0) {
      filtered.push(sortedData[0]);
      lastIncludedTime = new Date(sortedData[0].timestamp).getTime();
    }
    
    // Filter subsequent records to maintain proper interval spacing
    for (let i = 1; i < sortedData.length && filtered.length < 20; i++) {
      const currentTime = new Date(sortedData[i].timestamp).getTime();
      
      // Only include if enough time has passed since the last included record
      if (lastIncludedTime && (lastIncludedTime - currentTime) >= intervalMs) {
        filtered.push(sortedData[i]);
        lastIncludedTime = currentTime;
      }
    }
    
    return filtered;
  };
  
  // Update history items when data changes
  useEffect(() => {
    if (uptimeData && uptimeData.length > 0) {
      // Filter data based on the service interval
      const filteredData = filterUptimeDataByInterval(uptimeData, interval);
      setHistoryItems(filteredData);
    } else if (status === "paused" || (uptimeData && uptimeData.length === 0)) {
      // For paused services with no history, or empty history data, show all as paused
      const statusValue = (status === "up" || status === "down" || status === "warning" || status === "paused") 
        ? status 
        : "paused"; // Default to paused if not a valid status
        
      const placeholderHistory: UptimeData[] = Array(20).fill(null).map((_, index) => ({
        id: `placeholder-${index}`,
        serviceId: serviceId || "",
        timestamp: new Date(Date.now() - (index * interval * 1000)).toISOString(),
        status: statusValue as "up" | "down" | "warning" | "paused",
        responseTime: 0
      }));
      setHistoryItems(placeholderHistory);
    }
  }, [uptimeData, serviceId, status, interval]);

  // Ensure we always have 20 items by padding with the last known status
  const getDisplayItems = (): UptimeData[] => {
    const displayItems = [...historyItems];
    if (displayItems.length < 20) {
      const lastItem = displayItems.length > 0 ? displayItems[displayItems.length - 1] : null;
      const lastStatus = lastItem ? lastItem.status : 
                        (status === "up" || status === "down" || status === "warning" || status === "paused") ? 
                        status as "up" | "down" | "warning" | "paused" : "paused";
      
      // Generate padding items with proper time spacing
      const paddingItems: UptimeData[] = Array(20 - displayItems.length).fill(null).map((_, index) => {
        const baseTime = lastItem ? new Date(lastItem.timestamp).getTime() : Date.now();
        const timeOffset = (index + 1) * interval * 1000; // Respect the interval
        
        return {
          id: `padding-${index}`,
          serviceId: serviceId || "",
          timestamp: new Date(baseTime - timeOffset).toISOString(),
          status: lastStatus,
          responseTime: 0
        };
      });
      displayItems.push(...paddingItems);
    }

    return displayItems.slice(0, 20);
  };

  return {
    displayItems: getDisplayItems(),
    isLoading,
    error,
    isFetching,
    refetch
  };
};