
interface DetailedTooltipContentProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

export const DetailedTooltipContent = ({ active, payload, label }: DetailedTooltipContentProps) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0]?.payload;

  return (
    <div className="bg-popover/95 border border-border backdrop-blur-sm rounded-lg p-3 shadow-lg">
      <p className="font-medium text-popover-foreground mb-2">{label}</p>
      {data?.fullTimestamp && (
        <p className="text-xs text-muted-foreground mb-2">
          {new Date(data.fullTimestamp).toLocaleString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })}
        </p>
      )}
      {payload.map((entry: any, index: number) => {
        const data = entry.payload;
        return (
          <div key={index} className="space-y-1">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm font-medium">{entry.name}: {entry.value}%</span>
            </div>
            {entry.dataKey === 'cpuUsage' && (
              <div className="text-xs text-muted-foreground ml-5">
                <div>CPU Cores: {data.cpuCores}</div>
                <div>Free: {data.cpuFree}%</div>
              </div>
            )}
            {entry.dataKey === 'ramUsagePercent' && (
              <div className="text-xs text-muted-foreground ml-5">
                <div>Used: {data.ramUsed}</div>
                <div>Total: {data.ramTotal}</div>
                <div>Free: {data.ramFree}</div>
              </div>
            )}
            {entry.dataKey === 'diskUsagePercent' && (
              <div className="text-xs text-muted-foreground ml-5">
                <div>Used: {data.diskUsed}</div>
                <div>Total: {data.diskTotal}</div>
                <div>Free: {data.diskFree}</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};