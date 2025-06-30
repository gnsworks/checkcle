
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Server } from "@/types/server.types";
import { Cpu, HardDrive, MemoryStick, Clock, Activity, Info } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface ServerMetricsOverviewProps {
  server: Server;
}

export const ServerMetricsOverview = ({ server }: ServerMetricsOverviewProps) => {
  const { theme } = useTheme();

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'up':
        return 'text-green-500';
      case 'down':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      default:
        return 'text-muted-foreground';
    }
  };

  const cpuUsagePercent = server.cpu_usage || 0;
  const ramUsagePercent = server.ram_total > 0 ? (server.ram_used / server.ram_total) * 100 : 0;
  const diskUsagePercent = server.disk_total > 0 ? (server.disk_used / server.disk_total) * 100 : 0;

  const MetricCard = ({ title, used, total, free, percentage, icon: Icon, color, additionalInfo }: {
    title: string;
    used: string;
    total: string;
    free: string;
    percentage: number;
    icon: any;
    color: string;
    additionalInfo?: string;
  }) => (
    <Card className="relative overflow-hidden bg-gradient-to-br from-card/80 via-card to-card/60 border border-border/60 shadow-lg hover:shadow-xl hover:border-border/80 transition-all duration-300 backdrop-blur-sm group">
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/[0.02] to-white/[0.05] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <CardHeader className="pb-3 relative">
        <CardTitle className="flex items-center justify-between text-sm font-semibold">
          <div className="flex items-center gap-3">
            <div 
              className="p-2.5 rounded-xl shadow-sm ring-1 ring-white/10 transition-all duration-300 group-hover:scale-110"
              style={{ 
                backgroundColor: `${color}15`,
                boxShadow: `0 4px 12px ${color}20`
              }}
            >
              <Icon className="h-4 w-4" style={{ color }} />
            </div>
            <span className="text-foreground/90">{title}</span>
          </div>
          <div className="text-xs font-mono font-bold px-2 py-1 rounded-md" style={{ 
            color, 
            backgroundColor: `${color}10`,
            border: `1px solid ${color}30`
          }}>
            {percentage.toFixed(1)}%
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 relative">
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Used:</span>
              <span className="font-mono font-semibold text-foreground">{used}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Free:</span>
              <span className="font-mono font-semibold text-foreground">{free}</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total:</span>
              <span className="font-mono font-semibold text-foreground">{total}</span>
            </div>
            {additionalInfo && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cores:</span>
                <span className="font-mono font-semibold text-foreground">{additionalInfo}</span>
              </div>
            )}
          </div>
        </div>
        <div className="w-full bg-muted/40 rounded-full h-3 overflow-hidden shadow-inner">
          <div 
            className="h-3 rounded-full transition-all duration-700 ease-out relative overflow-hidden"
            style={{ 
              width: `${Math.min(percentage, 100)}%`,
              backgroundColor: color,
              boxShadow: `0 0 12px ${color}50, inset 0 1px 0 rgba(255,255,255,0.2)`
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-white/10" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
      {/* Status Card */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-card/80 via-card to-card/60 border border-border/60 shadow-lg hover:shadow-xl hover:border-border/80 transition-all duration-300 backdrop-blur-sm group">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/[0.02] to-white/[0.05] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <CardHeader className="pb-3 relative">
          <CardTitle className="flex items-center gap-3 text-sm font-semibold">
            <div className="p-2.5 rounded-xl bg-primary/15 shadow-sm ring-1 ring-white/10 transition-all duration-300 group-hover:scale-110" style={{ boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)' }}>
              <Activity className="h-4 w-4 text-primary" />
            </div>
            <span className="text-foreground/90">Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 relative">
          <div className={`text-lg font-bold capitalize ${getStatusColor(server.status)} flex items-center gap-3`}>
            <div className={`w-3 h-3 rounded-full ${server.status === 'up' ? 'bg-green-500' : server.status === 'down' ? 'bg-red-500' : 'bg-yellow-500'} animate-pulse shadow-sm`} style={{ 
              boxShadow: `0 0 8px ${server.status === 'up' ? '#10b981' : server.status === 'down' ? '#ef4444' : '#f59e0b'}` 
            }} />
            {server.status}
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Agent:</span>
              <span className="font-semibold text-foreground">{server.agent_status}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Connection:</span>
              <span className="font-semibold text-foreground">{server.connection}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Uptime Card */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-card/80 via-card to-card/60 border border-border/60 shadow-lg hover:shadow-xl hover:border-border/80 transition-all duration-300 backdrop-blur-sm group">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/[0.02] to-white/[0.05] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <CardHeader className="pb-3 relative">
          <CardTitle className="flex items-center gap-3 text-sm font-semibold">
            <div className="p-2.5 rounded-xl bg-blue-500/15 shadow-sm ring-1 ring-white/10 transition-all duration-300 group-hover:scale-110" style={{ boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)' }}>
              <Clock className="h-4 w-4 text-blue-500" />
            </div>
            <span className="text-foreground/90">Uptime</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 relative">
          <div className="text-lg font-bold text-blue-500">
            {server.uptime}
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <div>Last Check:</div>
            <div className="font-mono text-[10px] text-foreground/80 bg-muted/30 px-2 py-1 rounded">
              {new Date(server.last_checked).toLocaleString()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CPU Metric */}
      <MetricCard
        title="CPU"
        used={`${cpuUsagePercent.toFixed(1)}%`}
        total={`${server.cpu_cores} cores`}
        free={`${(100 - cpuUsagePercent).toFixed(1)}%`}
        percentage={cpuUsagePercent}
        icon={Cpu}
        color={theme === 'dark' ? "#3b82f6" : "#2563eb"}
        additionalInfo={server.cpu_cores?.toString()}
      />

      {/* Memory Metric */}
      <MetricCard
        title="Memory"
        used={formatBytes(server.ram_used)}
        total={formatBytes(server.ram_total)}
        free={formatBytes(server.ram_total - server.ram_used)}
        percentage={ramUsagePercent}
        icon={MemoryStick}
        color={theme === 'dark' ? "#10b981" : "#059669"}
      />

      {/* Disk Metric */}
      <MetricCard
        title="Disk"
        used={formatBytes(server.disk_used)}
        total={formatBytes(server.disk_total)}
        free={formatBytes(server.disk_total - server.disk_used)}
        percentage={diskUsagePercent}
        icon={HardDrive}
        color={theme === 'dark' ? "#f59e0b" : "#d97706"}
      />

      {/* System Info Card */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-card/80 via-card to-card/60 border border-border/60 shadow-lg hover:shadow-xl hover:border-border/80 transition-all duration-300 backdrop-blur-sm group xl:col-span-2">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/[0.02] to-white/[0.05] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <CardHeader className="pb-3 relative">
          <CardTitle className="flex items-center gap-3 text-sm font-semibold">
            <div className="p-2.5 rounded-xl bg-purple-500/15 shadow-sm ring-1 ring-white/10 transition-all duration-300 group-hover:scale-110" style={{ boxShadow: '0 4px 12px rgba(168, 85, 247, 0.2)' }}>
              <Info className="h-4 w-4 text-purple-500" />
            </div>
            <span className="text-foreground/90">System Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-3">
              <div className="bg-muted/20 rounded-lg p-3">
                <span className="text-muted-foreground block mb-1">Operating System:</span>
                <div className="font-semibold text-foreground">{server.os_type}</div>
              </div>
              <div className="bg-muted/20 rounded-lg p-3">
                <span className="text-muted-foreground block mb-1">Hostname:</span>
                <div className="font-mono text-xs text-foreground break-all">{server.hostname}</div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="bg-muted/20 rounded-lg p-3">
                <span className="text-muted-foreground block mb-1">IP Address:</span>
                <div className="font-mono text-xs text-foreground">{server.ip_address}</div>
              </div>
              {server.system_info && (
                <div className="bg-muted/20 rounded-lg p-3">
                  <span className="text-muted-foreground block mb-1">System Details:</span>
                  <div className="font-mono text-[10px] text-foreground/80 line-clamp-3 leading-relaxed" title={server.system_info}>
                    {server.system_info}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};