
import { useState, useMemo } from "react";
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
    refetchInterval: timeRange === '60m' ? 60000 : timeRange === '1d' ? 120000 : 300000, // Significantly increased intervals
    staleTime: timeRange === '60m' ? 30000 : timeRange === '1d' ? 60000 : 120000, // Increased stale time
    retry: 1, // Reduced retries to prevent excessive requests
    retryDelay: 2000, // Slower retry
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    refetchOnWindowFocus: false, // Prevent refetch on window focus
    refetchOnMount: false, // Prevent refetch on mount if data exists
  });

  // Memoize chart data formatting to prevent unnecessary recalculations
  const chartData = useMemo(() => {
    return formatChartData(metrics, timeRange);
  }, [metrics, timeRange]);

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