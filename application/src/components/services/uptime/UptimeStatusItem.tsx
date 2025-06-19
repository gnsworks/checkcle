
import React from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { UptimeData } from '@/types/service.types';
import { useTheme } from '@/contexts/ThemeContext';

interface UptimeStatusItemProps {
  item: UptimeData;
  index: number;
}

export const UptimeStatusItem = ({ item, index }: UptimeStatusItemProps) => {
  const { theme } = useTheme();

  // Get appropriate color classes for each status type
  const getStatusColor = (itemStatus: string) => {
    switch(itemStatus) {
      case "up":
        return theme === "dark" ? "bg-emerald-500" : "bg-emerald-500"; 
      case "down":
        return theme === "dark" ? "bg-red-500" : "bg-red-500";
      case "warning":
        return theme === "dark" ? "bg-yellow-500" : "bg-yellow-500";
      case "paused":
      default:
        return theme === "dark" ? "bg-gray-500" : "bg-gray-400";
    }
  };
  
  // Get status label
  const getStatusLabel = (itemStatus: string): string => {
    switch(itemStatus) {
      case "up": return "Online";
      case "down": return "Offline";
      case "warning": return "Degraded";
      case "paused": return "Paused";
      default: return "Unknown";
    }
  };
  
  // Format timestamp for display
  const formatTimestamp = (timestamp: string): string => {
    try {
      return new Date(timestamp).toLocaleString([], {
        hour: '2-digit', 
        minute: '2-digit',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return timestamp;
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div 
          className={`h-5 w-1.5 rounded-sm ${getStatusColor(item.status)} cursor-pointer hover:opacity-80 transition-opacity`}
        />
      </TooltipTrigger>
      <TooltipContent 
        side="top"
        className="bg-gray-900 text-white border-gray-800 px-3 py-2"
      >
        <div className="flex flex-col gap-1 text-xs">
          <div className="font-medium">{getStatusLabel(item.status)}</div>
          <div>
            {item.status !== "paused" && item.status !== "down" ? 
              `${item.responseTime}ms` : 
              "No response"}
          </div>
          <div className="text-gray-400">
            {formatTimestamp(item.timestamp)}
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};