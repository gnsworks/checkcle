import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, LineChart, Line } from "recharts";
import { UptimeData } from "@/types/service.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/contexts/ThemeContext";
import { useMemo } from "react";
import { format } from "date-fns";

interface ResponseTimeChartProps {
  uptimeData: UptimeData[];
}

export function ResponseTimeChart({ uptimeData }: ResponseTimeChartProps) {
  const { theme } = useTheme();
  
  // Modern color palette for different chart lines with solid colors at 90-100% opacity
  const modernColors = [
    { stroke: '#f59e0b', fill: 'rgba(111, 86, 63, 0.95)' }, // Yellow (changed from blue)
    { stroke: '#10b981', fill: 'rgba(0, 84, 56, 0.95)' }, // Emerald
    { stroke: '#3b82f6', fill: 'rgba(59, 130, 246, 0.95)' }, // Blue (moved to second position)
    { stroke: '#ef4444', fill: 'rgba(239, 68, 68, 0.95)' }, // Red
    { stroke: '#8b5cf6', fill: 'rgba(139, 92, 246, 0.95)' }, // Violet
    { stroke: '#06b6d4', fill: 'rgba(6, 182, 212, 0.95)' }, // Cyan
    { stroke: '#f97316', fill: 'rgba(231, 148, 89, 0.95)' }, // Orange
    { stroke: '#84cc16', fill: 'rgba(132, 204, 22, 0.95)' }, // Lime
  ];
  
  // Check if we have data from multiple sources
  const hasMultipleSources = useMemo(() => {
    const sources = new Set();
    uptimeData.forEach(data => {
      const source = data.source || 'default';
      sources.add(source);
    });
    return sources.size > 1;
  }, [uptimeData]);

  // Format data for the chart with enhanced time formatting
  const chartData = useMemo(() => {
    if (!uptimeData || uptimeData.length === 0) return [];
    
    if (hasMultipleSources) {
      // Group data by timestamp for multi-source display
      const timeGroups = new Map();
      
      uptimeData.forEach(data => {
        const timestamp = new Date(data.timestamp);
        // Round to nearest minute for better grouping
        const roundedTime = new Date(timestamp.getFullYear(), timestamp.getMonth(), timestamp.getDate(), 
                                   timestamp.getHours(), timestamp.getMinutes());
        const timeKey = roundedTime.getTime();
        const source = data.source || 'default';
        
        if (!timeGroups.has(timeKey)) {
          timeGroups.set(timeKey, {
            time: format(roundedTime, 'HH:mm'),
            rawTime: timeKey,
            date: format(roundedTime, 'MMM dd, yyyy'),
            timestamp: data.timestamp
          });
        }
        
        const group = timeGroups.get(timeKey);
        
        // Handle different data sources properly
        if (source === 'default') {
          // Only add pure default if we don't already have regional data with agent_id 1
          const hasRegionalDefault = uptimeData.some(d => 
            d.region_name === 'Default' && (d.agent_id === '1' || d.agent_id === 1)
          );
          
          if (!hasRegionalDefault) {
            group.defaultValue = data.status === "paused" ? null : data.responseTime;
            group.defaultStatus = data.status;
          }
        } else {
          // Regional monitoring data - distinguish by region and agent
          const sourceKey = `regional_${source.replace('|', '_')}`;
          
          // Group by the same timestamp more accurately
          const currentValue = group[`${sourceKey}_value`];
          const newValue = data.status === "paused" ? null : data.responseTime;
          
          if (currentValue !== undefined && newValue !== null) {
            // Average multiple values for the same time slot
            const count = group[`${sourceKey}_count`] || 1;
            group[`${sourceKey}_value`] = ((currentValue * count) + newValue) / (count + 1);
            group[`${sourceKey}_count`] = count + 1;
          } else if (newValue !== null) {
            group[`${sourceKey}_value`] = newValue;
            group[`${sourceKey}_count`] = 1;
          }
          
          group[`${sourceKey}_status`] = data.status;
          group[`${sourceKey}_label`] = data.region_name || source;
          group[`${sourceKey}_agent_id`] = data.agent_id;
        }
      });
      
      return Array.from(timeGroups.values())
        .sort((a, b) => a.rawTime - b.rawTime)
        .slice(-50); // Show last 50 data points for better performance
    } else {
      // Single source display - use original styling
      const sortedData = [...uptimeData].sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      
      const isShortTimeRange = uptimeData.length > 0 &&
        (new Date(uptimeData[0].timestamp).getTime() - new Date(uptimeData[uptimeData.length - 1].timestamp).getTime()) < 2 * 60 * 60 * 1000;
      
      return sortedData.map(data => {
        const timestamp = new Date(data.timestamp);
        
        return {
          time: isShortTimeRange 
            ? format(timestamp, 'HH:mm:ss')
            : format(timestamp, 'HH:mm'),
          rawTime: timestamp.getTime(),
          date: format(timestamp, 'MMM dd, yyyy'),
          value: data.status === "paused" ? null : data.responseTime,
          status: data.status,
          upValue: data.status === "up" ? data.responseTime : null,
          downValue: data.status === "down" ? data.responseTime : null,
          warningValue: data.status === "warning" ? data.responseTime : null,
        };
      });
    }
  }, [uptimeData, hasMultipleSources]);
  
  // Calculate Y-axis domain for better positioning
  const yAxisDomain = useMemo(() => {
    if (!chartData.length) return [0, 100];
    
    let allValues: number[] = [];
    
    if (hasMultipleSources) {
      chartData.forEach(d => {
        Object.keys(d).forEach(key => {
          if (key.endsWith('_value') || key === 'defaultValue') {
            const value = d[key as keyof typeof d];
            if (value !== null && value !== undefined && typeof value === 'number') {
              allValues.push(value);
            }
          }
        });
      });
    } else {
      allValues = chartData
        .filter(d => d.value !== null && d.status !== 'paused')
        .map(d => d.value as number)
        .filter(v => typeof v === 'number');
    }
    
    if (allValues.length === 0) return [0, 100];
    
    const minValue = Math.min(...allValues);
    const maxValue = Math.max(...allValues);
    const padding = Math.max((maxValue - minValue) * 0.1, 10);
    
    return [Math.max(0, minValue - padding), maxValue + padding];
  }, [chartData, hasMultipleSources]);

  // Get unique sources for legend with proper labeling and colors
  const sources = useMemo(() => {
    if (!hasMultipleSources) return [];
    
    const sourceSet = new Set<string>();
    const sourceInfo = new Map<string, any>();
    
    uptimeData.forEach(data => {
      const source = data.source || 'default';
      if (source !== 'default') {
        sourceSet.add(source);
        sourceInfo.set(source, data);
      }
    });
    
    const regionalSources = Array.from(sourceSet).map((source, index) => {
      const data = sourceInfo.get(source);
      const [regionName, agentId] = source.split('|');
      
      // Create proper label with region and agent info
      let label = regionName;
      if (data?.agent_id && data.agent_id !== '1') {
        label = `${regionName} (${data.agent_id})`;
      } else if (regionName === 'Default' && data?.agent_id === '1') {
        label = `Default System Check (Agent 1)`;
      }
      
      const colorIndex = index % modernColors.length;
      
      return {
        key: `regional_${source.replace('|', '_')}`,
        label: label,
        stroke: modernColors[colorIndex].stroke,
        fill: modernColors[colorIndex].fill
      };
    });

    // Only add pure default monitoring if we have it AND no regional Default with agent_id 1
    const hasRegionalDefault = uptimeData.some(data => 
      data.region_name === 'Default' && (data.agent_id === '1' || data.agent_id === 1)
    );
    const hasPureDefault = uptimeData.some(data => data.source === 'default');
    
    const defaultSources = (hasPureDefault && !hasRegionalDefault) ? [{
      key: 'default',
      label: 'Default',
      stroke: modernColors[regionalSources.length % modernColors.length].stroke,
      fill: modernColors[regionalSources.length % modernColors.length].fill
    }] : [];

    return [...defaultSources, ...regionalSources];
  }, [uptimeData, hasMultipleSources]);
  
  // Create a custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className={`${theme === 'dark' ? 'bg-gray-900' : 'bg-white'} p-3 border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} rounded shadow-md min-w-48`}>
          <p className="text-sm font-medium">{String(label)}</p>
          <p className="text-xs text-muted-foreground mb-2">{String(data.date)}</p>
          
          {hasMultipleSources ? (
            // Multi-source tooltip
            <div className="space-y-2">
              {sources.map(source => {
                const valueKey = source.key === 'default' ? 'defaultValue' : `${source.key}_value`;
                const statusKey = source.key === 'default' ? 'defaultStatus' : `${source.key}_status`;
                const value = data[valueKey];
                const status = data[statusKey];
                
                if (value === undefined && status === undefined) return null;
                
                let statusColor = "bg-gray-800";
                let statusText = "No Data";
                
                if (status === "up") {
                  statusColor = "bg-emerald-800";
                  statusText = "Up";
                } else if (status === "down") {
                  statusColor = "bg-red-800";
                  statusText = "Down";
                } else if (status === "warning") {
                  statusColor = "bg-yellow-800";
                  statusText = "Warning";
                } else if (status === "paused") {
                  statusColor = "bg-gray-800";
                  statusText = "Paused";
                }
                
                return (
                  <div key={source.key} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: source.stroke }}
                      ></div>
                      <span className="text-xs">{String(source.label)}</span>
                    </div>
                    <div className="text-xs font-mono">
                      {status === "paused" ? "Paused" : 
                       value !== null && value !== undefined ? `${value} ms` : "No data"}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // Single source tooltip - showing status with color
            <>
              <div className={`flex items-center gap-2 mt-1 ${data.status === "paused" ? "opacity-70" : ""}`}>
                <div className={`w-3 h-3 rounded-full ${
                  data.status === "up" ? "bg-emerald-800" :
                  data.status === "down" ? "bg-red-800" :
                  data.status === "warning" ? "bg-yellow-800" : "bg-gray-800"
                }`}></div>
                <span>{
                  data.status === "up" ? "Up" :
                  data.status === "down" ? "Down" :
                  data.status === "warning" ? "Warning" : "Paused"
                }</span>
              </div>
              <p className="mt-1 font-mono text-sm">
                {data.status === "paused" ? "Monitoring paused" : 
                 data.value !== null ? `${data.value} ms` : "No data"}
              </p>
            </>
          )}
        </div>
      );
    }
    return null;
  };

  // Check if we have any data to display
  const hasData = uptimeData.length > 0;
  
  // Get date range for display
  const dateRange = useMemo(() => {
    if (!chartData.length) return { start: "", end: "" };
    
    const sortedData = [...chartData].sort((a, b) => a.rawTime - b.rawTime);
    return {
      start: sortedData[0]?.date || "",
      end: sortedData[sortedData.length - 1]?.date || ""
    };
  }, [chartData]);
  
  // Display date range if different dates
  const dateRangeDisplay = dateRange.start === dateRange.end 
    ? dateRange.start 
    : `${dateRange.start} - ${dateRange.end}`;
  
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex flex-col md:flex-row md:items-center gap-2 justify-between">
          <span>Response Time History</span>
          {hasData && (
            <span className="text-sm font-normal text-muted-foreground">
              {dateRangeDisplay}
            </span>
          )}
        </CardTitle>
        {hasMultipleSources && (
          <div className="flex flex-wrap gap-4 text-sm">
            {sources.map(source => (
              <div key={source.key} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: source.stroke }}
                ></div>
                <span>{String(source.label)}</span>
              </div>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="h-80 flex items-center justify-center text-muted-foreground">
            <p>No data available for the selected time period.</p>
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {hasMultipleSources ? (
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#333' : '#e5e7eb'} />
                  <XAxis 
                    dataKey="time" 
                    stroke={theme === 'dark' ? '#666' : '#9ca3af'}
                    angle={-45}
                    textAnchor="end"
                    tick={{ fontSize: 10 }}
                    height={60}
                    interval="preserveStartEnd"
                    minTickGap={5}
                  />
                  <YAxis 
                    stroke={theme === 'dark' ? '#666' : '#9ca3af'} 
                    allowDecimals={false}
                    domain={yAxisDomain}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  
                  {/* Default monitoring area with modern solid background */}
                  {sources.find(s => s.key === 'default') && (
                    <Area
                      type="monotone"
                      dataKey="defaultValue"
                      stroke={sources.find(s => s.key === 'default')?.stroke}
                      fill={sources.find(s => s.key === 'default')?.fill}
                      strokeWidth={2.5}
                      dot={false}
                      connectNulls={false}
                    />
                  )}
                  
                  {/* Regional monitoring areas with modern solid backgrounds */}
                  {sources.filter(s => s.key !== 'default').map((source) => (
                    <Area
                      key={source.key}
                      type="monotone" 
                      dataKey={`${source.key}_value`}
                      stroke={source.stroke}
                      fill={source.fill}
                      strokeWidth={2.5}
                      dot={false}
                      connectNulls={false}
                    />
                  ))}
                </AreaChart>
              ) : (
                // For single regional agent or default monitoring only - use solid background colors
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#333' : '#e5e7eb'} />
                  <XAxis 
                    dataKey="time" 
                    stroke={theme === 'dark' ? '#666' : '#9ca3af'}
                    angle={-45}
                    textAnchor="end"
                    tick={{ fontSize: 10 }}
                    height={60}
                    interval="preserveStartEnd"
                    minTickGap={5}
                  />
                  <YAxis 
                    stroke={theme === 'dark' ? '#666' : '#9ca3af'} 
                    allowDecimals={false}
                    domain={yAxisDomain}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  
                  {/* Modern solid background areas for different statuses */}
                  <Area 
                    type="monotone" 
                    dataKey="upValue"
                    stroke="#10b981"
                    fill="rgba(16, 185, 129, 0.9)"
                    strokeWidth={2.5}
                    dot={false}
                    connectNulls={false}
                  />
                  
                  <Area 
                    type="monotone" 
                    dataKey="downValue"
                    stroke="#ef4444"
                    fill="rgba(239, 68, 68, 0.9)"
                    strokeWidth={2.5}
                    dot={false}
                    connectNulls={false}
                  />
                  
                  <Area 
                    type="monotone" 
                    dataKey="warningValue"
                    stroke="#f59e0b"
                    fill="rgba(245, 158, 11, 0.9)"
                    strokeWidth={2.5}
                    dot={false}
                    connectNulls={false}
                  />
                  
                  {/* Reference lines for paused status */}
                  {chartData.map((entry, index) => 
                    entry.status === 'paused' ? (
                      <ReferenceLine 
                        key={`ref-${index}`}
                        x={entry.time} 
                        stroke="#9ca3af"
                        strokeDasharray="3 3"
                      />
                    ) : null
                  )}
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}