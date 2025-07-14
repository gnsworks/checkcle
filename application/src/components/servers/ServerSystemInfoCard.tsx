import { Card, CardContent } from "@/components/ui/card";
import { Server, Monitor, Cpu, HardDrive, DatabaseIcon, InfoIcon } from "lucide-react";
import { Server as ServerType } from "@/types/server.types";

interface ServerSystemInfoCardProps {
  server: ServerType;
}

export function ServerSystemInfoCard({ server }: ServerSystemInfoCardProps) {
  // Parse system_info if it's a string
  let systemInfo: any = {};
  if (server.system_info) {
    try {
      systemInfo = typeof server.system_info === 'string' 
        ? JSON.parse(server.system_info) 
        : server.system_info;
    } catch (error) {
     // console.log('Error parsing system_info:', error);
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (uptimeSeconds: string | number) => {
    const seconds = typeof uptimeSeconds === 'string' ? parseInt(uptimeSeconds) : uptimeSeconds;
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // Format the detailed system info string
  const getDetailedSystemInfo = () => {
    if (typeof server.system_info === 'string' && server.system_info.includes('|')) {
      // If system_info is already in the detailed format, return it
      return server.system_info;
    }
    
    // Otherwise, build the detailed string from available data
    const parts = [];
    
    // Basic server info
    parts.push(server.hostname || 'Unknown');
    parts.push(server.ip_address || 'Unknown IP');
    parts.push(server.os_type || 'Unknown OS');
    
    // Parse additional info from system_info if available
    if (systemInfo.OSName) {
      parts.push(systemInfo.OSName + (systemInfo.OSVersion ? ` ${systemInfo.OSVersion}` : ''));
    }
    
    if (systemInfo.Architecture) {
      parts.push(`| ${systemInfo.Architecture}`);
    }
    
    if (systemInfo.KernelVersion) {
      parts.push(`| Kernel: ${systemInfo.KernelVersion}`);
    }
    
    if (systemInfo.CPUModel) {
      parts.push(`| CPU: ${systemInfo.CPUModel} (${server.cpu_cores || 0} cores)`);
    } else if (server.cpu_cores) {
      parts.push(`| CPU: ${server.cpu_cores} cores`);
    }
    
    if (server.ram_total) {
      parts.push(`| RAM: ${formatBytes(server.ram_total)}`);
    }
    
    if (systemInfo.GoVersion) {
      parts.push(`| Go ${systemInfo.GoVersion}`);
    }
    
    if (systemInfo.IPAddress && systemInfo.IPAddress !== server.ip_address) {
      parts.push(`| IP: ${systemInfo.IPAddress}`);
    }
    
    // Check for Docker info
    const dockerInfo = server.docker || systemInfo.Docker;
    if (dockerInfo !== undefined) {
      parts.push(`| Docker: ${dockerInfo}`);
    }
    
    return parts.join(' • ').replace(/• \|/g, '|');
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50 max-w-md">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center">
            <InfoIcon className="h-3 w-3 text-primary" />
          </div>
          <h3 className="text-sm font-medium">System Information</h3>
        </div>
        
        <div className="text-xs text-muted-foreground leading-relaxed break-all">
          {getDetailedSystemInfo()}
        </div>
      </CardContent>
    </Card>
  );
}