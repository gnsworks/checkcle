
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import { Cpu } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { DetailedTooltipContent } from "./tooltips/DetailedTooltipContent";

interface CPUChartProps {
  data: any[];
  latestData?: any;
}

export const CPUChart = ({ data, latestData }: CPUChartProps) => {
  const { theme } = useTheme();

  const getGridColor = () => theme === 'dark' ? '#374151' : '#e5e7eb';
  const getAxisColor = () => theme === 'dark' ? '#9ca3af' : '#6b7280';

  return (
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
          <AreaChart data={data}>
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
  );
};