import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { serverService } from "@/services/serverService";
import { Loader2, TrendingUp, Cpu, HardDrive, Wifi, MemoryStick } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { TimeRangeSelector } from "./charts/TimeRangeSelector";
import { useState } from "react";
import { formatChartData, filterMetricsByTimeRange, formatBytes } from "./charts/dataUtils";

interface ServerHistoryChartsProps {
  serverId: string;
}

type TimeRange = '60m' | '1d' | '7d' | '1m' | '3m';

export const ServerHistoryCharts = ({ serverId }: ServerHistoryChartsProps) => {
  const { theme } = useTheme();
  const [timeRange, setTimeRange] = useState<TimeRange>("1d");

  console.log('ServerHistoryCharts: Rendering with serverId:', serverId);

  const {
    data: metrics = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['server-metrics-history', serverId, timeRange],
    queryFn: async () => {
      console.log('ServerHistoryCharts: Fetching metrics for serverId:', serverId, 'timeRange:', timeRange);
      const result = await serverService.getServerMetrics(serverId, timeRange);
      console.log('ServerHistoryCharts: Raw metrics result for timeRange', timeRange, ':', result?.length || 0, 'records');
      console.log('ServerHistoryCharts: First 3 records:', result?.slice(0, 3));
      return result;
    },
    enabled: !!serverId,
    refetchInterval: 60000,
    retry: 1
  });

  console.log('ServerHistoryCharts: Query state:', { 
    metricsCount: metrics.length, 
    isLoading, 
    error: error?.message,
    firstMetric: metrics[0],
    serverId,
    timeRange
  });

  console.log('ServerHistoryCharts: About to format chart data with', metrics?.length || 0, 'metrics for timeRange:', timeRange);
  const chartData = formatChartData(metrics, timeRange);
  console.log('ServerHistoryCharts: After formatting, got', chartData?.length || 0, 'chart data points');

  const getGridColor = () => theme === 'dark' ? '#374151' : '#e5e7eb';
  const getAxisColor = () => theme === 'dark' ? '#9ca3af' : '#6b7280';

  // Custom tooltip content with detailed information and full date/time
  const DetailedTooltipContent = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload;
      return (
        <div className="bg-popover/95 border border-border backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <p className="font-medium text-popover-foreground mb-2">{label}</p>
          {data?.fullTimestamp && (
            <p className="text-xs text-muted-foreground mb-2">
              {new Date(data.fullTimestamp).toLocaleString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
            </p>
          )}
          {payload.map((entry: any, index: number) => {
            const data = entry.payload;
            return (
              <div key={index} className="space-y-1">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm font-medium">{entry.name}: {entry.value}%</span>
                </div>
                {entry.dataKey === 'cpuUsage' && (
                  <div className="text-xs text-muted-foreground ml-5">
                    <div>CPU Cores: {data.cpuCores}</div>
                    <div>Free: {data.cpuFree}%</div>
                  </div>
                )}
                {entry.dataKey === 'ramUsagePercent' && (
                  <div className="text-xs text-muted-foreground ml-5">
                    <div>Used: {data.ramUsed}</div>
                    <div>Total: {data.ramTotal}</div>
                    <div>Free: {data.ramFree}</div>
                  </div>
                )}
                {entry.dataKey === 'diskUsagePercent' && (
                  <div className="text-xs text-muted-foreground ml-5">
                    <div>Used: {data.diskUsed}</div>
                    <div>Total: {data.diskTotal}</div>
                    <div>Free: {data.diskFree}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  // Network tooltip with detailed info and full date/time
  const NetworkTooltipContent = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload;
      return (
        <div className="bg-popover/95 border border-border backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <p className="font-medium text-popover-foreground mb-2">{label}</p>
          {data?.fullTimestamp && (
            <p className="text-xs text-muted-foreground mb-2">
              {new Date(data.fullTimestamp).toLocaleString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
            </p>
          )}
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 mb-1">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm font-medium">
                {entry.name}: {entry.dataKey.includes('Speed') ? `${entry.value} KB/s` : formatBytes(entry.value)}
              </span>
            </div>
          ))}
          {data && (
            <div className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
              <div>Total RX: {data.networkRx}</div>
              <div>Total TX: {data.networkTx}</div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            <h2 className="text-lg font-medium">Historical Performance</h2>
            <Loader2 className="h-4 w-4 animate-spin ml-2" />
          </div>
          <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
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
          <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
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
          <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-muted-foreground">No historical data available for {timeRange}</p>
              <p className="text-xs mt-2">Raw metrics count: {metrics.length}</p>
              <p className="text-xs mt-1">Server ID: {serverId}</p>
              <p className="text-xs mt-1 text-muted-foreground">
                {metrics.length > 0 ? 'Data exists but filtered out by time range' : 'No metrics data found'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log('ServerHistoryCharts: Rendering charts with', chartData.length, 'data points for time range:', timeRange);

  // Calculate summary stats from latest data point
  const latestData = chartData[chartData.length - 1];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          <h2 className="text-lg font-medium">Historical Performance</h2>
          <span className="text-xs text-muted-foreground">({chartData.length} data points • {timeRange})</span>
        </div>
        <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CPU Usage Chart - Smooth Area Chart with Blue Gradient */}
        <Card className="bg-gradient-to-br from-background to-muted/20 border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-foreground">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-500/15">
                  <Cpu className="h-5 w-5 text-blue-500" />
                </div>
                CPU Usage
              </div>
              {latestData && (
                <div className="text-right text-sm">
                  <div className="text-blue-500 font-semibold">{latestData.cpuUsage}%</div>
                  <div className="text-xs text-muted-foreground">{latestData.cpuCores} cores</div>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <ChartContainer config={{
              cpuUsage: {
                label: "CPU Usage (%)",
                color: theme === 'dark' ? "#3b82f6" : "#2563eb",
              }
            }} className="h-80">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme === 'dark' ? "#3b82f6" : "#2563eb"} stopOpacity={0.4}/>
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
                  content={<DetailedTooltipContent />}
                  cursor={{ stroke: getGridColor() }}
                />
                <Area 
                  type="monotone" 
                  dataKey="cpuUsage" 
                  stroke={theme === 'dark' ? "#60a5fa" : "#2563eb"}
                  strokeWidth={3}
                  dot={false}
                  fill="url(#cpuGradient)"
                  fillOpacity={1}
                  name="CPU Usage (%)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Memory Usage Chart - Basis Area Chart with Green Gradient */}
        <Card className="bg-gradient-to-br from-background to-muted/20 border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-foreground">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-green-500/15">
                  <MemoryStick className="h-5 w-5 text-green-500" />
                </div>
                Memory Usage
              </div>
              {latestData && (
                <div className="text-right text-sm">
                  <div className="text-green-500 font-semibold">{latestData.ramUsagePercent}%</div>
                  <div className="text-xs text-muted-foreground">{latestData.ramUsed} / {latestData.ramTotal}</div>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <ChartContainer config={{
              ramUsagePercent: {
                label: "Memory Usage (%)",
                color: theme === 'dark' ? "#10b981" : "#059669",
              }
            }} className="h-80">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="memoryGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme === 'dark' ? "#10b981" : "#059669"} stopOpacity={0.5}/>
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
                  content={<DetailedTooltipContent />}
                  cursor={{ stroke: getGridColor() }}
                />
                <Area 
                  type="basis" 
                  dataKey="ramUsagePercent" 
                  stroke={theme === 'dark' ? "#34d399" : "#059669"}
                  strokeWidth={3}
                  dot={false}
                  fill="url(#memoryGradient)"
                  fillOpacity={1}
                  name="Memory Usage (%)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Disk Usage Chart - Stepped Area Chart with Orange Gradient */}
        <Card className="bg-gradient-to-br from-background to-muted/20 border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-foreground">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-500/15">
                  <HardDrive className="h-5 w-5 text-amber-500" />
                </div>
                Disk Usage
              </div>
              {latestData && (
                <div className="text-right text-sm">
                  <div className="text-amber-500 font-semibold">{latestData.diskUsagePercent}%</div>
                  <div className="text-xs text-muted-foreground">{latestData.diskUsed} / {latestData.diskTotal}</div>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <ChartContainer config={{
              diskUsagePercent: {
                label: "Disk Usage (%)",
                color: theme === 'dark' ? "#f59e0b" : "#d97706",
              }
            }} className="h-80">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="diskGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme === 'dark' ? "#f59e0b" : "#d97706"} stopOpacity={0.6}/>
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
                  content={<DetailedTooltipContent />}
                  cursor={{ stroke: getGridColor() }}
                />
                <Area 
                  type="step" 
                  dataKey="diskUsagePercent" 
                  stroke={theme === 'dark' ? "#fbbf24" : "#d97706"}
                  strokeWidth={3}
                  dot={false}
                  fill="url(#diskGradient)"
                  fillOpacity={1}
                  name="Disk Usage (%)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Network Traffic Chart - Dual Line Chart with Purple/Red Theme */}
        <Card className="bg-gradient-to-br from-background to-muted/20 border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-foreground">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-purple-500/15">
                  <Wifi className="h-5 w-5 text-purple-500" />
                </div>
                Network Traffic
              </div>
              {latestData && (
                <div className="text-right text-sm">
                  <div className="text-purple-500 font-semibold">{latestData.networkRxSpeed} KB/s ↓</div>
                  <div className="text-red-500 font-semibold">{latestData.networkTxSpeed} KB/s ↑</div>
                </div>
              )}
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
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge> 
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
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
                  label={{ value: 'Network Speed (KB/s)', angle: -90, position: 'insideLeft' }}
                />
                <ChartTooltip 
                  content={<NetworkTooltipContent />}
                  cursor={{ stroke: getGridColor() }}
                />
                <Line 
                  type="monotone" 
                  dataKey="networkRxSpeed" 
                  stroke={theme === 'dark' ? "#a78bfa" : "#7c3aed"}
                  strokeWidth={3}
                  dot={false}
                  name="RX Speed"
                  filter="url(#glow)"
                  strokeDasharray="0"
                />
                <Line 
                  type="monotone" 
                  dataKey="networkTxSpeed" 
                  stroke={theme === 'dark' ? "#f87171" : "#dc2626"}
                  strokeWidth={3}
                  dot={false}
                  name="TX Speed"
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};