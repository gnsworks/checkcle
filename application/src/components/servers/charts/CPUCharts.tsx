
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import { Cpu } from "lucide-react";
import { useChartConfig } from "./chartConfig";
import { formatBytes } from "./dataUtils";

interface CPUChartsProps {
  data: any[];
}

export const CPUCharts = ({ data }: CPUChartsProps) => {
  const { chartConfig, getGridColor, getAxisColor } = useChartConfig();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="bg-gradient-to-br from-card/90 via-card to-card/80 border-border/50 shadow-xl backdrop-blur-sm overflow-hidden group hover:shadow-2xl transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <CardHeader className="relative">
          <CardTitle className="text-foreground flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <Cpu className="h-4 w-4 text-blue-500" />
            </div>
            CPU Usage
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <ChartContainer config={chartConfig} className="h-80">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="50%" stopColor="#60a5fa" stopOpacity={0.4}/>
                  <stop offset="100%" stopColor="#93c5fd" stopOpacity={0.1}/>
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge> 
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
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
                cursor={{ stroke: '#3b82f6', strokeWidth: 2, strokeOpacity: 0.5 }}
              />
              <Area 
                type="monotone" 
                dataKey="cpuUsage" 
                stroke="#3b82f6"
                strokeWidth={3}
                fill="url(#cpuGradient)"
                dot={false}
                name="CPU Usage (%)"
                filter="url(#glow)"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-card/90 via-card to-card/80 border-border/50 shadow-xl backdrop-blur-sm overflow-hidden group hover:shadow-2xl transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <CardHeader className="relative">
          <CardTitle className="text-foreground flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <Cpu className="h-4 w-4 text-blue-500" />
            </div>
            CPU Usage Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <ChartContainer config={chartConfig} className="h-80">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="cpuUsedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9}/>
                  <stop offset="100%" stopColor="#1e40af" stopOpacity={0.3}/>
                </linearGradient>
                <linearGradient id="cpuFreeGradient" x1="0" y1="0" x2="0" y2="1">
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
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: getAxisColor() }}
                axisLine={false}
                tickLine={false}
              />
              <ChartTooltip 
                content={<ChartTooltipContent className="bg-popover/95 border-border backdrop-blur-sm" />}
                cursor={{ stroke: '#3b82f6', strokeWidth: 2, strokeOpacity: 0.5 }}
              />
              <Area 
                type="monotone" 
                dataKey="cpuFree" 
                stackId="1"
                stroke="#64748b"
                strokeWidth={2}
                fill="url(#cpuFreeGradient)"
                name="CPU Available (%)"
              />
              <Area 
                type="monotone" 
                dataKey="cpuUsage" 
                stackId="1"
                stroke="#3b82f6"
                strokeWidth={3}
                fill="url(#cpuUsedGradient)"
                name="CPU Usage (%)"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};