
import React from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useUptimeData } from "./hooks/useUptimeData";
import { UptimeStatusItem } from "./uptime/UptimeStatusItem";
import { UptimeSummary } from "./uptime/UptimeSummary";
import { UptimeLoadingState } from "./uptime/UptimeLoadingState";
import { UptimeErrorState } from "./uptime/UptimeErrorState";

interface UptimeBarProps {
  uptime: number;
  status: string;
  serviceId?: string;
  interval?: number; // Service monitoring interval in seconds
  serviceType?: string; // Add service type for proper data fetching
}

export const UptimeBar = ({ uptime, status, serviceId, interval = 60, serviceType }: UptimeBarProps) => {
  const { displayItems, isLoading, error, isFetching, refetch } = useUptimeData({
    serviceId,
    serviceType,
    status,
    interval
  });

  // If still loading and no history, show improved loading state
  if ((isLoading || isFetching) && displayItems.length === 0) {
    return <UptimeLoadingState />;
  }
  
  // If there's an error and no history, show improved error state with retry button
  if (error && displayItems.length === 0) {
    return <UptimeErrorState uptime={uptime} onRetry={refetch} />;
  }
  
  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-col w-full gap-1">
        <div className="flex items-center space-x-0.5 w-full h-6">
          {displayItems.map((item, index) => (
            <UptimeStatusItem 
              key={item.id || `status-${index}`} 
              item={item} 
              index={index}
            />
          ))}
        </div>
        <UptimeSummary uptime={uptime} interval={interval} />
      </div>
    </TooltipProvider>
  );
}