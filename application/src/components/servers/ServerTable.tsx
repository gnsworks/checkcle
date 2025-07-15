
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { RefreshCw, Search, Eye, Activity, MoreHorizontal, Pause, Play, Edit, Trash2 } from "lucide-react";
import { Server } from "@/types/server.types";
import { ServerStatusBadge } from "./ServerStatusBadge";
import { OSTypeIcon } from "./OSTypeIcon";
import { serverService } from "@/services/serverService";

interface ServerTableProps {
  servers: Server[];
  isLoading: boolean;
  onRefresh: () => void;
}

export const ServerTable = ({ servers, isLoading, onRefresh }: ServerTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [pausedServers, setPausedServers] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  const filteredServers = servers.filter(server =>
    server.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    server.hostname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    server.ip_address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (serverId: string) => {
    navigate(`/server-detail/${serverId}`);
  };

  const handleViewContainers = (serverId: string) => {
    navigate(`/container-monitoring/${serverId}`);
  };

  const handlePauseResume = (serverId: string) => {
    const isPaused = pausedServers.has(serverId);
    if (isPaused) {
      setPausedServers(prev => {
        const newSet = new Set(prev);
        newSet.delete(serverId);
        return newSet;
      });
    //  console.log('Resume server monitoring:', serverId);
    } else {
      setPausedServers(prev => new Set(prev).add(serverId));
    //  console.log('Pause server monitoring:', serverId);
    }
  };

  const handleEdit = (serverId: string) => {
    // TODO: Implement edit functionality
  //  console.log('Edit server:', serverId);
  };

  const handleDelete = (serverId: string) => {
    // TODO: Implement delete functionality
  //  console.log('Delete server:', serverId);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Servers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading servers...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-xl font-semibold">Servers</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search servers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button onClick={onRefresh} variant="outline" size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredServers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No servers found</p>
          </div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>OS</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>CPU</TableHead>
                  <TableHead>Memory</TableHead>
                  <TableHead>Disk</TableHead>
                  <TableHead>Uptime</TableHead>
                  <TableHead>Last Checked</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServers.map((server) => {
                  const cpuUsage = server.cpu_usage || 0;
                  const memoryUsage = server.ram_total > 0 ? (server.ram_used / server.ram_total) * 100 : 0;
                  const diskUsage = server.disk_total > 0 ? (server.disk_used / server.disk_total) * 100 : 0;
                  const isPaused = pausedServers.has(server.id);

                  return (
                    <TableRow key={server.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div>
                          <div className="font-medium">{server.name}</div>
                          
                        </div>
                      </TableCell>
                      <TableCell>
                        <ServerStatusBadge status={server.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <OSTypeIcon osType={server.os_type} />
                          <span className="text-sm">{server.os_type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-sm bg-muted px-1 py-0.5 rounded">{server.ip_address}</code>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 min-w-[120px]">
                          <div className="flex justify-between text-sm">
                            <span>{cpuUsage.toFixed(1)}%</span>
                            <span className="text-muted-foreground">{server.cpu_cores} cores</span>
                          </div>
                          <Progress 
                            value={cpuUsage} 
                            className="h-2"
                            indicatorClassName={
                              cpuUsage > 90 ? "bg-red-00" : 
                              cpuUsage > 75 ? "bg-orange-500" :
                              cpuUsage > 60 ? "bg-yellow-500" : "bg-green-500"
                            }
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 min-w-[120px]">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{memoryUsage.toFixed(1)}%</span>
                            <span>{serverService.formatBytes(server.ram_total)}</span>
                          </div>
                          <Progress 
                            value={memoryUsage} 
                            className="h-2"
                            indicatorClassName={
                              memoryUsage > 90 ? "bg-red-500" : 
                              memoryUsage > 75 ? "bg-yellow-500" : "bg-blue-500"
                            }
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 min-w-[120px]">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{diskUsage.toFixed(1)}%</span>
                            <span>{serverService.formatBytes(server.disk_total)}</span>
                          </div>
                          <Progress 
                            value={diskUsage} 
                            className="h-2"
                            indicatorClassName={
                              diskUsage > 95 ? "bg-red-500" : 
                              diskUsage > 85 ? "bg-yellow-500" : "bg-orange-500"
                            }
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{server.uptime}</div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {new Date(server.last_checked).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[200px]">
                            <DropdownMenuItem onClick={() => handleViewDetails(server.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Server Detail
                            </DropdownMenuItem>
                            {server.docker === 'true' && (
                              <DropdownMenuItem onClick={() => handleViewContainers(server.id)}>
                                <Activity className="mr-2 h-4 w-4" />
                                Container Monitoring
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handlePauseResume(server.id)}>
                              {isPaused ? (
                                <>
                                  <Play className="mr-2 h-4 w-4" />
                                  Resume Monitoring
                                </>
                              ) : (
                                <>
                                  <Pause className="mr-2 h-4 w-4" />
                                  Pause Monitoring
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleEdit(server.id)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Server
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(server.id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Server
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};