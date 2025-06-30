
import { TableCell, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { DockerContainer } from "@/types/docker.types";
import { DockerStatusBadge } from "../DockerStatusBadge";
import { DockerRowActions } from "./DockerRowActions";
import { dockerService } from "@/services/dockerService";

interface DockerTableRowProps {
  container: DockerContainer;
  onRowClick: (container: DockerContainer) => void;
  onContainerAction: (action: string, containerId: string, containerName: string) => void;
  onViewMetrics: (container: DockerContainer) => void;
}

export const DockerTableRow = ({ container, onRowClick, onContainerAction, onViewMetrics }: DockerTableRowProps) => {
  const cpuPercentage = container.cpu_usage;
  const memoryPercentage = Math.round((container.ram_used / container.ram_total) * 100);
  const diskPercentage = Math.round((container.disk_used / container.disk_total) * 100);
  const containerStatus = dockerService.getStatusFromDockerStatus(container.status);

  const formatPercentage = (used: number, total: number) => {
    if (total === 0) return "0%";
    return `${Math.round((used / total) * 100)}%`;
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return "text-red-500";
    if (percentage >= 70) return "text-amber-500";
    return "text-emerald-500";
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 70) return "bg-amber-500";
    return "bg-emerald-500";
  };

  return (
    <TableRow 
      className="hover:bg-muted/50 transition-colors border-border cursor-pointer"
      onClick={() => onRowClick(container)}
    >
      <TableCell className="font-medium">
        <div className="space-y-1">
          <div className="font-semibold text-sm sm:text-base text-foreground">{container.name}</div>
          <div className="text-xs sm:text-sm text-muted-foreground">
            <div className="font-mono">{container.docker_id}</div>
            <div className="font-mono">{container.hostname}</div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <DockerStatusBadge status={containerStatus} />
      </TableCell>
      <TableCell>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <Progress 
              value={cpuPercentage} 
              className="flex-1 h-2 bg-muted/50"
              indicatorClassName={getProgressColor(cpuPercentage)}
            />
            <span className={`font-semibold text-sm min-w-[40px] text-right ${getUsageColor(cpuPercentage)}`}>
              {cpuPercentage}%
            </span>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <Progress 
              value={memoryPercentage} 
              className="flex-1 h-2 bg-muted/50"
              indicatorClassName={getProgressColor(memoryPercentage)}
            />
            <span className={`font-semibold text-sm min-w-[40px] text-right ${getUsageColor(memoryPercentage)}`}>
              {formatPercentage(container.ram_used, container.ram_total)}
            </span>
          </div>
          <div className="text-xs text-muted-foreground font-mono">
            {dockerService.formatBytes(container.ram_used)} / {dockerService.formatBytes(container.ram_total)}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <Progress 
              value={diskPercentage} 
              className="flex-1 h-2 bg-muted/50"
              indicatorClassName={getProgressColor(diskPercentage)}
            />
            <span className={`font-semibold text-sm min-w-[40px] text-right ${getUsageColor(diskPercentage)}`}>
              {formatPercentage(container.disk_used, container.disk_total)}
            </span>
          </div>
          <div className="text-xs text-muted-foreground font-mono">
            {dockerService.formatBytes(container.disk_used)} / {dockerService.formatBytes(container.disk_total)}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <span className="text-xs sm:text-sm font-medium font-mono">
          {dockerService.formatUptime(container.uptime)}
        </span>
      </TableCell>
      <TableCell>
        <span className="text-xs sm:text-sm text-muted-foreground">
          {new Date(container.last_checked).toLocaleString()}
        </span>
      </TableCell>
      <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
        <DockerRowActions 
          container={container}
          containerStatus={containerStatus}
          onContainerAction={onContainerAction}
          onViewMetrics={onViewMetrics}
        />
      </TableCell>
    </TableRow>
  );
};