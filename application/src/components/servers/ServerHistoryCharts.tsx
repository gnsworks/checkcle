import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { serverService } from "@/services/serverService";
import { Loader2, TrendingUp, Cpu, HardDrive, Wifi, MemoryStick } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { DateRangeFilter } from "@/components/services/DateRangeFilter";
import { useState } from "react";

interface ServerHistoryChartsProps {
  serverId: string;
}

export const ServerHistoryCharts = ({ serverId }: ServerHistoryChartsProps) => {
  const { theme } = useTheme();
  const [dateRange, setDateRange] = useState({ start: new Date(Date.now() - 24 * 60 * 60 * 1000), end: new Date() });

  console.log('ServerHistoryCharts: Rendering with serverId:', serverId);

  const {
    data: metrics = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['server-metrics-history', serverId],
    queryFn: async () => {
      console.log('ServerHistoryCharts: Fetching metrics for serverId:', serverId);
      const result = await serverService.getServerMetrics(serverId);
      console.log('ServerHistoryCharts: Raw metrics result:', result);
      return result;
    },
    enabled: !!serverId,
    refetchInterval: 60000, // Refresh every minute
    retry: 1
  });

  const handleDateRangeChange = (startDate: Date, endDate: Date, option: any) => {
    setDateRange({ start: startDate, end: endDate });
    console.log('Date range changed:', { startDate, endDate, option });
  };

  console.log('ServerHistoryCharts: Query state:', { 
    metricsCount: metrics.length, 
    isLoading, 
    error: error?.message,
    firstMetric: metrics[0],
    serverId
  });

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const parseValueWithUnit = (value: string | number) => {
    if (typeof value === 'number') return value;
    const match = value.toString().match(/^([\d.]+)/);
    return match ? parseFloat(match[1]) : 0;
  };

  const convertToBytes = (value: string | number): number => {
    if (typeof value === 'number') return value;
    
    const str = value.toString();
    const numMatch = str.match(/^([\d.]+)/);
    const unitMatch = str.match(/([A-Za-z]+)$/);
    
    if (!numMatch) return 0;
    
    const num = parseFloat(numMatch[1]);
    const unit = unitMatch ? unitMatch[1].toUpperCase() : 'B';
    
    const multipliers: { [key: string]: number } = {
      'B': 1,
      'KB': 1024,
      'MB': 1024 * 1024,
      'GB': 1024 * 1024 * 1024,
      'TB': 1024 * 1024 * 1024 * 1024
    };
    
    return num * (multipliers[unit] || 1);
  };

  const formatChartData = (metrics: any[]) => {
    console.log('ServerHistoryCharts: Formatting chart data for', metrics.length, 'metrics');
    
    if (!Array.isArray(metrics) || metrics.length === 0) {
      console.log('ServerHistoryCharts: No metrics to format');
      return [];
    }
    
    const formattedData = metrics.slice(-50).reverse().map((metric, index) => {
      console.log(`ServerHistoryCharts: Processing metric ${index}:`, metric);
      
      const cpuUsage = parseValueWithUnit(metric.cpu_usage || 0);
      const ramUsedBytes = convertToBytes(metric.ram_used || 0);
      const ramTotalBytes = convertToBytes(metric.ram_total || 0);
      const diskUsedBytes = convertToBytes(metric.disk_used || 0);
      const diskTotalBytes = convertToBytes(metric.disk_total || 0);
      
      const ramUsagePercent = ramTotalBytes > 0 ? (ramUsedBytes / ramTotalBytes) * 100 : 0;
      const diskUsagePercent = diskTotalBytes > 0 ? (diskUsedBytes / diskTotalBytes) * 100 : 0;

      return {
        timestamp: new Date(metric.timestamp || metric.created).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        fullTimestamp: new Date(metric.timestamp || metric.created).toLocaleString(),
        cpuUsage: Math.round(cpuUsage * 100) / 100,
        ramUsagePercent: Math.round(ramUsagePercent * 100) / 100,
        diskUsagePercent: Math.round(diskUsagePercent * 100) / 100,
        ramUsedBytes,
        ramTotalBytes,
        diskUsedBytes,
        diskTotalBytes,
        networkRxBytes: metric.network_rx_bytes || 0,
        networkTxBytes: metric.network_tx_bytes || 0,
        networkRxSpeed: parseValueWithUnit(metric.network_rx_speed || 0),
        networkTxSpeed: parseValueWithUnit(metric.network_tx_speed || 0),
      };
    });
    
    console.log('ServerHistoryCharts: Formatted chart data:', formattedData);
    return formattedData;
  };

  const chartData = formatChartData(metrics);

  const getGridColor = () => theme === 'dark' ? '#374151' : '#e5e7eb';
  const getAxisColor = () => theme === 'dark' ? '#9ca3af' : '#6b7280';

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            <h2 className="text-lg font-medium">Historical Performance</h2>
            <Loader2 className="h-4 w-4 animate-spin ml-2" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-5 w-5 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-80">
                  <div className="h-4 w-full bg-muted animate-pulse rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    console.error('ServerHistoryCharts: Error loading data:', error);
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            <h2 className="text-lg font-medium">Historical Performance</h2>
          </div>
          <DateRangeFilter onRangeChange={handleDateRangeChange} />
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-muted-foreground">Error loading chart data</p>
              <p className="text-xs mt-2 font-mono text-red-500">{error?.message}</p>
              <p className="text-xs mt-1 text-muted-foreground">Server ID: {serverId}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            <h2 className="text-lg font-medium">Historical Performance</h2>
          </div>
          <DateRangeFilter onRangeChange={handleDateRangeChange} />
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-muted-foreground">No historical data available</p>
              <p className="text-xs mt-2">Metrics count: {metrics.length}</p>
              <p className="text-xs mt-1">Server ID: {serverId}</p>
              <p className="text-xs mt-1 text-muted-foreground">
                {metrics.length > 0 ? 'Data exists but failed to format' : 'No metrics data found'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log('ServerHistoryCharts: Rendering individual charts with', chartData.length, 'data points');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          <h2 className="text-lg font-medium">Historical Performance</h2>
          <span className="text-xs text-muted-foreground">({chartData.length} data points)</span>
        </div>
        <DateRangeFilter onRangeChange={handleDateRangeChange} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CPU Usage Chart */}
        <Card className="bg-gradient-to-br from-background to-muted/20 border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <div className="p-2 rounded-lg bg-blue-500/15">
                <Cpu className="h-5 w-5 text-blue-500" />
              </div>
              CPU Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <ChartContainer config={{
              cpuUsage: {
                label: "CPU Usage (%)",
                color: theme === 'dark' ? "#3b82f6" : "#2563eb",
              }
            }} className="h-80">
              <LineChart data={chartData}>
                <defs>
                  <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme === 'dark' ? "#3b82f6" : "#2563eb"} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={theme === 'dark' ? "#1e40af" : "#1d4ed8"} stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={getGridColor()} opacity={0.3} />
                <XAxis 
                  dataKey="timestamp" 
                  tick={{ fontSize: 10, fill: getAxisColor() }}
                  axisLine={{ stroke: getGridColor() }}
                />
                <YAxis 
                  domain={[0, 100]}
                  tick={{ fontSize: 10, fill: getAxisColor() }}
                  axisLine={{ stroke: getGridColor() }}
                  label={{ value: 'CPU %', angle: -90, position: 'insideLeft' }}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent className="bg-popover border-border" />}
                  cursor={{ stroke: getGridColor() }}
                />
                <Line 
                  type="monotone" 
                  dataKey="cpuUsage" 
                  stroke={theme === 'dark' ? "#60a5fa" : "#2563eb"}
                  strokeWidth={3}
                  dot={false}
                  fill="url(#cpuGradient)"
                  fillOpacity={1}
                  name="CPU Usage (%)"
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Memory Usage Chart */}
        <Card className="bg-gradient-to-br from-background to-muted/20 border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <div className="p-2 rounded-lg bg-green-500/15">
                <MemoryStick className="h-5 w-5 text-green-500" />
              </div>
              Memory Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <ChartContainer config={{
              ramUsagePercent: {
                label: "Memory Usage (%)",
                color: theme === 'dark' ? "#10b981" : "#059669",
              }
            }} className="h-80">
              <LineChart data={chartData}>
                <defs>
                  <linearGradient id="memoryGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme === 'dark' ? "#10b981" : "#059669"} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={theme === 'dark' ? "#047857" : "#065f46"} stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={getGridColor()} opacity={0.3} />
                <XAxis 
                  dataKey="timestamp" 
                  tick={{ fontSize: 10, fill: getAxisColor() }}
                  axisLine={{ stroke: getGridColor() }}
                />
                <YAxis 
                  domain={[0, 100]}
                  tick={{ fontSize: 10, fill: getAxisColor() }}
                  axisLine={{ stroke: getGridColor() }}
                  label={{ value: 'Memory %', angle: -90, position: 'insideLeft' }}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent className="bg-popover border-border" />}
                  cursor={{ stroke: getGridColor() }}
                />
                <Line 
                  type="monotone" 
                  dataKey="ramUsagePercent" 
                  stroke={theme === 'dark' ? "#34d399" : "#059669"}
                  strokeWidth={3}
                  dot={false}
                  fill="url(#memoryGradient)"
                  fillOpacity={1}
                  name="Memory Usage (%)"
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Disk Usage Chart */}
        <Card className="bg-gradient-to-br from-background to-muted/20 border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <div className="p-2 rounded-lg bg-amber-500/15">
                <HardDrive className="h-5 w-5 text-amber-500" />
              </div>
              Disk Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <ChartContainer config={{
              diskUsagePercent: {
                label: "Disk Usage (%)",
                color: theme === 'dark' ? "#f59e0b" : "#d97706",
              }
            }} className="h-80">
              <LineChart data={chartData}>
                <defs>
                  <linearGradient id="diskGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme === 'dark' ? "#f59e0b" : "#d97706"} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={theme === 'dark' ? "#d97706" : "#b45309"} stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={getGridColor()} opacity={0.3} />
                <XAxis 
                  dataKey="timestamp" 
                  tick={{ fontSize: 10, fill: getAxisColor() }}
                  axisLine={{ stroke: getGridColor() }}
                />
                <YAxis 
                  domain={[0, 100]}
                  tick={{ fontSize: 10, fill: getAxisColor() }}
                  axisLine={{ stroke: getGridColor() }}
                  label={{ value: 'Disk %', angle: -90, position: 'insideLeft' }}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent className="bg-popover border-border" />}
                  cursor={{ stroke: getGridColor() }}
                />
                <Line 
                  type="monotone" 
                  dataKey="diskUsagePercent" 
                  stroke={theme === 'dark' ? "#fbbf24" : "#d97706"}
                  strokeWidth={3}
                  dot={false}
                  fill="url(#diskGradient)"
                  fillOpacity={1}
                  name="Disk Usage (%)"
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Network Traffic Chart */}
        <Card className="bg-gradient-to-br from-background to-muted/20 border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <div className="p-2 rounded-lg bg-purple-500/15">
                <Wifi className="h-5 w-5 text-purple-500" />
              </div>
              Network Traffic
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <ChartContainer config={{
              networkRxSpeed: {
                label: "RX Speed",
                color: theme === 'dark' ? "#8b5cf6" : "#7c3aed",
              },
              networkTxSpeed: {
                label: "TX Speed", 
                color: theme === 'dark' ? "#ef4444" : "#dc2626",
              }
            }} className="h-80">
              <LineChart data={chartData}>
                <defs>
                  <linearGradient id="networkGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme === 'dark' ? "#8b5cf6" : "#7c3aed"} stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={theme === 'dark' ? "#7c3aed" : "#6d28d9"} stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={getGridColor()} opacity={0.3} />
                <XAxis 
                  dataKey="timestamp" 
                  tick={{ fontSize: 10, fill: getAxisColor() }}
                  axisLine={{ stroke: getGridColor() }}
                />
                <YAxis 
                  tick={{ fontSize: 10, fill: getAxisColor() }}
                  axisLine={{ stroke: getGridColor() }}
                  tickFormatter={(value) => formatBytes(value) + '/s'}
                  label={{ value: 'Network Speed', angle: -90, position: 'insideLeft' }}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent className="bg-popover border-border" />}
                  cursor={{ stroke: getGridColor() }}
                  formatter={(value, name) => [formatBytes(Number(value)) + '/s', name]}
                />
                <Line 
                  type="monotone" 
                  dataKey="networkRxSpeed" 
                  stroke={theme === 'dark' ? "#a78bfa" : "#7c3aed"}
                  strokeWidth={3}
                  dot={false}
                  fill="url(#networkGradient)"
                  fillOpacity={0.5}
                  name="RX Speed"
                />
                <Line 
                  type="monotone" 
                  dataKey="networkTxSpeed" 
                  stroke={theme === 'dark' ? "#f87171" : "#dc2626"}
                  strokeWidth={3}
                  dot={false}
                  name="TX Speed"
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};