
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
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
    <Card className="bg-gradient-to-br from-background to-muted/20 border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm h-full flex flex-col">
      <CardHeader className="pb-2 flex-shrink-0">
        <CardTitle className="flex items-center justify-between text-foreground">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/15">
              <HardDrive className="h-4 w-4 lg:h-5 lg:w-5 text-amber-500" />
            </div>
            <span className="text-sm lg:text-base">Disk Usage</span>
          </div>
          {latestData && (
            <div className="text-right text-xs lg:text-sm">
              <div className="text-amber-500 font-semibold">{latestData.diskUsagePercent}%</div>
              <div className="text-xs text-muted-foreground">{latestData.diskUsed} / {latestData.diskTotal}</div>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2 flex-1 min-h-0">
        <div className="w-full h-full min-h-[240px] lg:min-h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
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
                strokeWidth={2}
                dot={false}
                fill="url(#diskGradient)"
                fillOpacity={1}
                name="Disk Usage (%)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};