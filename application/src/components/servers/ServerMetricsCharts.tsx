
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { serverService } from "@/services/serverService";
import { Loader2, Cpu, HardDrive, Network, MemoryStick } from "lucide-react";
import { formatChartData } from "./charts/dataUtils";
import { TimeRangeSelector } from "./charts/TimeRangeSelector";
import { CPUChart } from "./charts/CPUChart";
import { MemoryChart } from "./charts/MemoryChart";
import { DiskChart } from "./charts/DiskChart";
import { NetworkChart } from "./charts/NetworkChart";

interface ServerMetricsChartsProps {
  serverId: string;
}

type TimeRange = '60m' | '1d' | '7d' | '1m' | '3m';

export const ServerMetricsCharts = ({ serverId }: ServerMetricsChartsProps) => {
  const [timeRange, setTimeRange] = useState<TimeRange>("1d");

  const {
    data: metrics = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['server-metrics', serverId, timeRange],
    queryFn: () => serverService.getServerMetrics(serverId, timeRange),
    enabled: !!serverId,
    refetchInterval: timeRange === '60m' ? 60000 : timeRange === '1d' ? 120000 : 300000, // Increased intervals
    staleTime: timeRange === '60m' ? 30000 : timeRange === '1d' ? 60000 : 120000, // Increased stale time
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    refetchOnWindowFocus: false, // Prevent refetch on window focus
  });

  const chartData = formatChartData(metrics, timeRange);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading server metrics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 text-muted-foreground">
        <p>Error loading server metrics: {error.message}</p>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-muted-foreground">
        <p>No server metrics data available for {timeRange}</p>
      </div>
    );
  }

  // Calculate latest data for each chart
  const latestData = chartData[chartData.length - 1];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-medium">Server Metrics</h2>
          <span className="text-xs text-muted-foreground">({chartData.length} data points • {timeRange})</span>
        </div>
        <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
      </div>

      <Tabs defaultValue="cpu" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-muted/50 backdrop-blur-sm">
          <TabsTrigger value="cpu" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Cpu className="h-4 w-4" />
            CPU
          </TabsTrigger>
          <TabsTrigger value="memory" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <MemoryStick className="h-4 w-4" />
            Memory
          </TabsTrigger>
          <TabsTrigger value="disk" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <HardDrive className="h-4 w-4" />
            Disk
          </TabsTrigger>
          <TabsTrigger value="network" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Network className="h-4 w-4" />
            Network
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cpu" className="space-y-4 mt-6">
          <CPUChart data={chartData} latestData={latestData} />
        </TabsContent>

        <TabsContent value="memory" className="space-y-4 mt-6">
          <MemoryChart data={chartData} latestData={latestData} />
        </TabsContent>

        <TabsContent value="disk" className="space-y-4 mt-6">
          <DiskChart data={chartData} latestData={latestData} />
        </TabsContent>

        <TabsContent value="network" className="space-y-4 mt-6">
          <NetworkChart data={chartData} latestData={latestData} />
        </TabsContent>
      </Tabs>
    </div>
  );
};