
import React from "react";
import { useConsolidatedUptimeData } from "./hooks/useConsolidatedUptimeData";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { UptimeSummary } from "./uptime/UptimeSummary";
import { formatRelative } from "date-fns";

interface UptimeBarProps {
  uptime: number;
  status: string;
  serviceId: string;
  interval: number;
  serviceType?: string;
}

export const UptimeBar = ({ uptime, status, serviceId, interval, serviceType }: UptimeBarProps) => {
  // Use consolidated hook to get properly merged data
  const { consolidatedItems, isLoading } = useConsolidatedUptimeData({
    serviceId,
    serviceType,
    status,
    interval
  });

  const getStatusColor = (itemStatus: string, hasData: boolean = true) => {
    if (!hasData) {
      return "bg-gray-300"; // No data color
    }
    
    switch (itemStatus) {
      case "up":
        return "bg-emerald-500";
      case "down":
        return "bg-red-500";
      case "warning":
        return "bg-yellow-500";
      case "paused":
        return "bg-gray-500"; // Distinct paused color (darker grey)
      default:
        return "bg-gray-300"; // Default fallback
    }
  };

  if (isLoading) {
    return (
      <div className="w-52">
        <div className="flex items-center gap-1">
          {Array(20).fill(null).map((_, index) => (
            <div key={index} className="h-6 w-1 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
        <UptimeSummary uptime={uptime} interval={interval} />
      </div>
    );
  }

  console.log('UptimeBar rendering consolidated items:', consolidatedItems.length);

  return (
    <div className="w-52">
      <TooltipProvider>
        <div className="flex items-center gap-1">
          {consolidatedItems.map((slot, index) => {
            // Check if we have actual monitoring data with valid status
            const hasValidData = slot.items.length > 0 && slot.items.some(item => 
              item.status && ['up', 'down', 'warning', 'paused'].includes(item.status)
            );

            // Determine the primary status for bar color (prioritize worst status)
            let primaryStatus = 'unknown';
            if (hasValidData) {
              const statuses = slot.items.map(item => item.status);
              primaryStatus = statuses.includes('down') ? 'down' :
                            statuses.includes('warning') ? 'warning' :
                            statuses.includes('up') ? 'up' : 
                            statuses.includes('paused') ? 'paused' : 'unknown';
            }

            console.log(`Bar ${index} - Timestamp: ${slot.timestamp}, Items: ${slot.items.length}, Primary Status: ${primaryStatus}, Has Valid Data: ${hasValidData}`);
            slot.items.forEach((item, itemIndex) => {
              console.log(`  Item ${itemIndex}: Source=${item.source}, Status=${item.status}, ResponseTime=${item.responseTime}, IsDefault=${item.isDefault}`);
            });

            return (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <div 
                    className={`h-6 w-1 rounded cursor-pointer ${getStatusColor(primaryStatus, hasValidData)}`}
                  />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <div className="text-sm">
                    <div className="font-medium mb-2 text-center">
                      {formatRelative(new Date(slot.timestamp), new Date())}
                    </div>
                    {hasValidData ? (
                      <div className="space-y-2">
                        {slot.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                item.status === 'up' ? 'bg-emerald-500' :
                                item.status === 'down' ? 'bg-red-500' :
                                item.status === 'warning' ? 'bg-yellow-500' : 
                                item.status === 'paused' ? 'bg-gray-500' : 'bg-gray-300'
                              }`} />
                              <span className="text-xs font-medium truncate">{item.source}</span>
                            </div>
                            <div className="text-xs font-mono text-right flex-shrink-0">
                              {item.status === 'paused' ? 'Paused' :
                               item.responseTime && item.responseTime > 0 ? `${item.responseTime}ms` : 
                               'No response'}
                            </div>
                          </div>
                        ))}
                        {slot.items.length > 1 && (
                          <div className="border-t pt-1 mt-2 text-xs text-muted-foreground text-center">
                            {slot.items.length} monitoring sources
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground text-center">
                        No monitoring data available
                      </div>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>
      <UptimeSummary uptime={uptime} interval={interval} />
    </div>
  );
};