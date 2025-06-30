
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import { MemoryStick } from "lucide-react";
import { useChartConfig } from "./chartConfig";
import { formatBytes } from "./dataUtils";

interface MemoryChartsProps {
  data: any[];
}

export const MemoryCharts = ({ data }: MemoryChartsProps) => {
  const { chartConfig, getGridColor, getAxisColor } = useChartConfig();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="bg-gradient-to-br from-card/90 via-card to-card/80 border-border/50 shadow-xl backdrop-blur-sm overflow-hidden group hover:shadow-2xl transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <CardHeader className="relative">
          <CardTitle className="text-foreground flex items-center gap-2">
            <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
              <MemoryStick className="h-4 w-4 text-green-500" />
            </div>
            Memory Usage
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <ChartContainer config={chartConfig} className="h-80">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="memoryGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="50%" stopColor="#34d399" stopOpacity={0.4}/>
                  <stop offset="100%" stopColor="#6ee7b7" stopOpacity={0.1}/>
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
                cursor={{ stroke: '#10b981', strokeWidth: 2, strokeOpacity: 0.5 }}
              />
              <Area 
                type="monotone" 
                dataKey="ramUsagePercent" 
                stroke="#10b981"
                strokeWidth={3}
                fill="url(#memoryGradient)"
                dot={false}
                name="RAM Usage (%)"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-card/90 via-card to-card/80 border-border/50 shadow-xl backdrop-blur-sm overflow-hidden group hover:shadow-2xl transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <CardHeader className="relative">
          <CardTitle className="text-foreground flex items-center gap-2">
            <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
              <MemoryStick className="h-4 w-4 text-green-500" />
            </div>
            Memory Usage (Bytes)
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <ChartContainer config={chartConfig} className="h-80">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="memoryUsedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.9}/>
                  <stop offset="100%" stopColor="#047857" stopOpacity={0.3}/>
                </linearGradient>
                <linearGradient id="memoryTotalGradient" x1="0" y1="0" x2="0" y2="1">
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
                cursor={{ stroke: '#10b981', strokeWidth: 2, strokeOpacity: 0.5 }}
                formatter={(value, name) => [
                  name === 'Used Memory' ? formatBytes(Number(value)) : 
                  name === 'Total Memory' ? formatBytes(Number(value)) : value,
                  name
                ]}
              />
              <Area 
                type="monotone" 
                dataKey="ramTotalBytes" 
                stackId="1"
                stroke="#64748b"
                strokeWidth={2}
                fill="url(#memoryTotalGradient)"
                name="Total Memory"
              />
              <Area 
                type="monotone" 
                dataKey="ramUsedBytes" 
                stackId="1"
                stroke="#10b981"
                strokeWidth={3}
                fill="url(#memoryUsedGradient)"
                name="Used Memory"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};