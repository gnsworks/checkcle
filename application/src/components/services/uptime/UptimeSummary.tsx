
import React from 'react';

interface UptimeSummaryProps {
  uptime: number;
  interval: number;
}

export const UptimeSummary = ({ uptime, interval }: UptimeSummaryProps) => {
  return (
    <div className="flex items-center justify-between text-xs mt-1">
      <span className="text-muted-foreground">
        {Math.round(uptime)}% uptime
      </span>
      <span className="text-xs text-muted-foreground">
        Last 20 checks
      </span>
    </div>
  );
};