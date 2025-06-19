
import React from 'react';

export const UptimeLoadingState = () => {
  return (
    <div className="flex flex-col w-full gap-1">
      <div className="flex items-center space-x-0.5 w-full h-6">
        {Array(20).fill(0).map((_, index) => (
          <div 
            key={`skeleton-${index}`}
            className={`h-5 w-1.5 rounded-sm bg-muted animate-pulse`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground w-16 h-4 bg-muted animate-pulse rounded"></span>
        <span className="text-muted-foreground w-24 h-4 bg-muted animate-pulse rounded"></span>
      </div>
    </div>
  );
};