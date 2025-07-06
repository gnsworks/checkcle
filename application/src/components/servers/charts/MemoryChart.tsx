
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import { MemoryStick } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { DetailedTooltipContent } from "./tooltips/DetailedTooltipContent";

interface MemoryChartProps {
  data: any[];
  latestData?: any;
}

export const MemoryChart = ({ data, latestData }: MemoryChartProps) => {
  const { theme } = useTheme();

  const getGridColor = () => theme === 'dark' ? '#374151' : '#e5e7eb';
  const getAxisColor = () => theme === 'dark' ? '#9ca3af' : '#6b7280';

  return (
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
          <AreaChart data={data}>
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
  );
};