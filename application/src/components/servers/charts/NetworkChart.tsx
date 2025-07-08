
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { Wifi } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { NetworkTooltipContent } from "./tooltips/NetworkTooltipContent";

interface NetworkChartProps {
  data: any[];
  latestData?: any;
}

export const NetworkChart = ({ data, latestData }: NetworkChartProps) => {
  const { theme } = useTheme();

  const getGridColor = () => theme === 'dark' ? '#374151' : '#e5e7eb';
  const getAxisColor = () => theme === 'dark' ? '#9ca3af' : '#6b7280';

  return (
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
          <LineChart data={data}>
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
  );
};