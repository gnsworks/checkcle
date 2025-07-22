
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
  
  // Fetch ALL uptime history data including regional monitoring data with 1-minute polling
  const { data: uptimeData, isLoading, error, isFetching, refetch } = useQuery({
    queryKey: ['allUptimeHistory', serviceId, serviceType],
    queryFn: async () => {
      if (!serviceId) {
        console.log('No serviceId provided, skipping fetch');
        return [];
      }
      console.log(`Fetching ALL uptime data for service ${serviceId} of type ${serviceType} - including regional monitoring`);
      
      // Get raw uptime history data
      const rawData = await uptimeService.getUptimeHistory(serviceId, 50, undefined, undefined, serviceType);
      
      // Include ALL monitoring data - both default and regional
      const allMonitoringData = rawData.filter(record => record.service_id === serviceId);
      
      console.log(`Retrieved ${rawData.length} total records, filtered to ${allMonitoringData.length} records for service ${serviceId}`);
      return allMonitoringData;
    },
    enabled: !!serviceId,
    refetchInterval: 60000, // 1 minute polling
    staleTime: 30000, // Data is fresh for 30 seconds
    placeholderData: (previousData) => previousData,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
  
  // Process uptime data to include both default and regional monitoring
  const processUptimeData = (data: UptimeData[], intervalSeconds: number): UptimeData[] => {
    if (!data || data.length === 0) return [];
    
    console.log(`Processing ${data.length} uptime records (all monitoring data) for service ${serviceId}`);
    
    // Sort data by timestamp (newest first)
    const sortedData = [...data].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    // Take the most recent records to ensure we have enough data for both default and regional
    const recentData = sortedData.slice(0, 50);
    
    console.log(`Using ${recentData.length} most recent records including both default and regional monitoring`);
    
    return recentData;
  };
  
  // Update history items when data changes
  useEffect(() => {
    if (uptimeData && uptimeData.length > 0) {
      console.log(`Received ${uptimeData.length} uptime records (all monitoring) for service ${serviceId}`);
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
        service_id: serviceId || "",
        serviceId: serviceId || "",
        timestamp: new Date(Date.now() - (index * interval * 1000)).toISOString(),
        status: statusValue as "up" | "down" | "warning" | "paused",
        responseTime: 0
      }));
      
      setHistoryItems(placeholderHistory);
    }
  }, [uptimeData, serviceId, status, interval]);

  // Return display items - all monitoring data for tooltip usage
  const getDisplayItems = (): UptimeData[] => {
    return historyItems;
  };

  return {
    displayItems: getDisplayItems(),
    isLoading,
    error,
    isFetching,
    refetch
  };
};