
import React from 'react';

interface UptimeSummaryProps {
  uptime: number;
  interval: number;
}

export const UptimeSummary = ({ uptime, interval }: UptimeSummaryProps) => {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground">
        {Math.round(uptime)}% uptime
      </span>
      <span className="text-xs text-muted-foreground">
        Last 20 checks ({interval}s interval)
      </span>
    </div>
  );
};