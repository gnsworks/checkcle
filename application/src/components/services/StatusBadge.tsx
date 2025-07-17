
import React, { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

interface StatusBadgeProps {
  status: "up" | "down" | "paused" | "warning";
  size?: "sm" | "md" | "lg";
}

const StatusBadgeComponent = ({ status, size = "sm" }: StatusBadgeProps) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "up":
        return {
          variant: "default" as const,
          className: "bg-emerald-700 text-emerald-100 border-emerald-200 hover:bg-emerald-200",
          label:     
          <span className="flex items-center gap-1">
          <Check className="w-4 h-4" /> Up
          </span>
          
        };
      case "down":
        return {
          variant: "destructive" as const,
          className: "bg-red-700 text-red-100 border-red-200 hover:bg-red-200",
          label: "Down"
        };
      case "warning":
        return {
          variant: "destructive" as const,
          className: "bg-amber-700 text-amber-100 border-amber-200 hover:bg-amber-200",
          label: "Warning"
        };
      case "paused":
        return {
          variant: "secondary" as const,
          className: "bg-gray-700 text-gray-100 border-gray-200 hover:bg-gray-200",
          label: "Paused"
        };
      default:
        return {
          variant: "outline" as const,
          className: "bg-gray-700 text-gray-100 border-gray-200",
          label: "Unknown"
        };
    }
  };

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2"
  };

  const config = getStatusConfig(status);

  return (
    <Badge 
      variant={config.variant} 
      className={`${config.className} ${sizeClasses[size]} font-medium`}
    >
      {config.label}
    </Badge>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const StatusBadge = memo(StatusBadgeComponent);