
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import { HardDrive } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { DetailedTooltipContent } from "./tooltips/DetailedTooltipContent";

interface DiskChartProps {
  data: any[];
  latestData?: any;
}

export const DiskChart = ({ data, latestData }: DiskChartProps) => {
  const { theme } = useTheme();

  const getGridColor = () => theme === 'dark' ? '#374151' : '#e5e7eb';
  const getAxisColor = () => theme === 'dark' ? '#9ca3af' : '#6b7280';

  return (
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
          <AreaChart data={data}>
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
  );
};