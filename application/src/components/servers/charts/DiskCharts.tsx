
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import { HardDrive } from "lucide-react";
import { useChartConfig } from "./chartConfig";
import { formatBytes } from "./dataUtils";

interface DiskChartsProps {
  data: any[];
}

export const DiskCharts = ({ data }: DiskChartsProps) => {
  const { chartConfig, getGridColor, getAxisColor } = useChartConfig();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="bg-gradient-to-br from-card/90 via-card to-card/80 border-border/50 shadow-xl backdrop-blur-sm overflow-hidden group hover:shadow-2xl transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <CardHeader className="relative">
          <CardTitle className="text-foreground flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <HardDrive className="h-4 w-4 text-amber-500" />
            </div>
            Disk Usage
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <ChartContainer config={chartConfig} className="h-80">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="diskGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.8}/>
                  <stop offset="50%" stopColor="#fbbf24" stopOpacity={0.4}/>
                  <stop offset="100%" stopColor="#fcd34d" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="1 3" stroke={getGridColor()} opacity={0.3} />
              <XAxis 
                dataKey="timestamp" 
                tick={{ fontSize: 10, fill: getAxisColor() }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: getAxisColor() }}
                axisLine={false}
                tickLine={false}
              />
              <ChartTooltip 
                content={<ChartTooltipContent className="bg-popover/95 border-border backdrop-blur-sm" />}
                cursor={{ stroke: '#f59e0b', strokeWidth: 2, strokeOpacity: 0.5 }}
              />
              <Area 
                type="monotone" 
                dataKey="diskUsagePercent" 
                stroke="#f59e0b"
                strokeWidth={3}
                fill="url(#diskGradient)"
                dot={false}
                name="Disk Usage (%)"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-card/90 via-card to-card/80 border-border/50 shadow-xl backdrop-blur-sm overflow-hidden group hover:shadow-2xl transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <CardHeader className="relative">
          <CardTitle className="text-foreground flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <HardDrive className="h-4 w-4 text-amber-500" />
            </div>
            Disk Usage (Bytes)
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <ChartContainer config={chartConfig} className="h-80">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="diskUsedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.9}/>
                  <stop offset="100%" stopColor="#d97706" stopOpacity={0.3}/>
                </linearGradient>
                <linearGradient id="diskTotalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#94a3b8" stopOpacity={0.4}/>
                  <stop offset="100%" stopColor="#64748b" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="1 3" stroke={getGridColor()} opacity={0.3} />
              <XAxis 
                dataKey="timestamp" 
                tick={{ fontSize: 10, fill: getAxisColor() }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 10, fill: getAxisColor() }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => formatBytes(value)}
              />
              <ChartTooltip 
                content={<ChartTooltipContent className="bg-popover/95 border-border backdrop-blur-sm" />}
                cursor={{ stroke: '#f59e0b', strokeWidth: 2, strokeOpacity: 0.5 }}
                formatter={(value, name) => [
                  name === 'Used Disk' ? formatBytes(Number(value)) : 
                  name === 'Total Disk' ? formatBytes(Number(value)) : value,
                  name
                ]}
              />
              <Area 
                type="monotone" 
                dataKey="diskTotalBytes" 
                stackId="1"
                stroke="#64748b"
                strokeWidth={2}
                fill="url(#diskTotalGradient)"
                name="Total Disk"
              />
              <Area 
                type="monotone" 
                dataKey="diskUsedBytes" 
                stackId="1"
                stroke="#f59e0b"
                strokeWidth={3}
                fill="url(#diskUsedGradient)"
                name="Used Disk"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};