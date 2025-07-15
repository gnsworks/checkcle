
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { serverService } from "@/services/serverService";
import { formatChartData } from "../dataUtils";

type TimeRange = '60m' | '1d' | '7d' | '1m' | '3m';

export const useServerHistoryData = (serverId: string) => {
  const [timeRange, setTimeRange] = useState<TimeRange>("1d");

  const {
    data: metrics = [],
    isLoading,
    error,
    isFetching
  } = useQuery({
    queryKey: ['server-metrics-history', serverId, timeRange],
    queryFn: async () => {
    //  console.log('useServerHistoryData: Fetching metrics for serverId:', serverId, 'timeRange:', timeRange);
      const result = await serverService.getServerMetrics(serverId, timeRange);
    //  console.log('useServerHistoryData: Raw metrics result for timeRange', timeRange, ':', result?.length || 0, 'records');
      return result || [];
    },
    enabled: !!serverId,
    refetchInterval: timeRange === '60m' ? 30000 : timeRange === '1d' ? 60000 : 120000, // Reduced frequency
    staleTime: timeRange === '60m' ? 15000 : timeRange === '1d' ? 30000 : 60000, // Increased stale time
    retry: 2, // Reduced retries
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000), // Faster retry
    gcTime: 5 * 60 * 1000, // 5 minutes cache
  });

  // Memoize chart data formatting to prevent unnecessary recalculations
  const chartData = formatChartData(metrics, timeRange);

  return {
    timeRange,
    setTimeRange,
    metrics,
    chartData,
    isLoading,
    error,
    isFetching
  };
};