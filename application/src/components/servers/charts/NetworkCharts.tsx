
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import { Network } from "lucide-react";
import { useChartConfig } from "./chartConfig";

interface NetworkChartsProps {
  data: any[];
}

export const NetworkCharts = ({ data }: NetworkChartsProps) => {
  const { chartConfig, getGridColor, getAxisColor } = useChartConfig();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="bg-gradient-to-br from-card/90 via-card to-card/80 border-border/50 shadow-xl backdrop-blur-sm overflow-hidden group hover:shadow-2xl transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <CardHeader className="relative">
          <CardTitle className="text-foreground flex items-center gap-2">
            <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <Network className="h-4 w-4 text-purple-500" />
            </div>
            Network Traffic
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <ChartContainer config={chartConfig} className="h-64">
            <LineChart data={data}>
              <defs>
                <linearGradient id="networkRxGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.2}/>
                </linearGradient>
                <linearGradient id="networkTxGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8}/>
                  <stop offset="100%" stopColor="#f87171" stopOpacity={0.2}/>
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
              />
              <ChartTooltip 
                content={<ChartTooltipContent className="bg-popover/95 border-border backdrop-blur-sm" />}
                cursor={{ stroke: '#8b5cf6', strokeWidth: 2, strokeOpacity: 0.5 }}
              />
              <Line 
                type="monotone" 
                dataKey="networkRxBytes" 
                stroke="url(#networkRxGradient)"
                strokeWidth={3}
                name="RX Bytes"
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="networkTxBytes" 
                stroke="url(#networkTxGradient)"
                strokeWidth={3}
                name="TX Bytes"
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-card/90 via-card to-card/80 border-border/50 shadow-xl backdrop-blur-sm overflow-hidden group hover:shadow-2xl transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <CardHeader className="relative">
          <CardTitle className="text-foreground flex items-center gap-2">
            <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <Network className="h-4 w-4 text-purple-500" />
            </div>
            Network Speed (KB/s)
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <ChartContainer config={chartConfig} className="h-64">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="networkSpeedRxGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.6}/>
                  <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="networkSpeedTxGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.6}/>
                  <stop offset="100%" stopColor="#f87171" stopOpacity={0.1}/>
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
              />
              <ChartTooltip 
                content={<ChartTooltipContent className="bg-popover/95 border-border backdrop-blur-sm" />}
                cursor={{ stroke: '#8b5cf6', strokeWidth: 2, strokeOpacity: 0.5 }}
              />
              <Area 
                type="monotone" 
                dataKey="networkRxSpeed" 
                stroke="#8b5cf6"
                strokeWidth={3}
                fill="url(#networkSpeedRxGradient)"
                name="RX Speed (KB/s)"
                dot={false}
              />
              <Area 
                type="monotone" 
                dataKey="networkTxSpeed" 
                stroke="#ef4444"
                strokeWidth={3}
                fill="url(#networkSpeedTxGradient)"
                name="TX Speed (KB/s)"
                dot={false}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};