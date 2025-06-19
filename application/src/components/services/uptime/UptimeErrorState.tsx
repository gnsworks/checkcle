
import React from 'react';
import { X, RefreshCcw } from 'lucide-react';

interface UptimeErrorStateProps {
  uptime: number;
  onRetry: () => void;
}

export const UptimeErrorState = ({ uptime, onRetry }: UptimeErrorStateProps) => {
  return (
    <div className="flex flex-col w-full gap-1">
      <div className="flex items-center space-x-0.5 w-full h-6">
        {Array(20).fill(0).map((_, index) => (
          <div 
            key={`error-${index}`}
            className={`h-5 w-1.5 rounded-sm bg-gray-700 opacity-40`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{Math.round(uptime)}% uptime</span>
        <button 
          onClick={onRetry} 
          className="text-xs text-red-400 flex items-center gap-1 hover:text-red-300 transition-colors"
        >
          <X className="h-3 w-3" /> Connection error 
          <RefreshCcw className="h-3 w-3 ml-1" />
        </button>
      </div>
    </div>
  );
};