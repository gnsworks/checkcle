
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { RefreshCw, Search, Eye, Activity, MoreHorizontal, Pause, Play, Edit, Trash2 } from "lucide-react";
import { Server } from "@/types/server.types";
import { ServerStatusBadge } from "./ServerStatusBadge";
import { OSTypeIcon } from "./OSTypeIcon";
import { serverService } from "@/services/serverService";
import { useToast } from "@/hooks/use-toast";
import { pb } from "@/lib/pocketbase";

interface ServerTableProps {
  servers: Server[];
  isLoading: boolean;
  onRefresh: () => void;
}

export const ServerTable = ({ servers, isLoading, onRefresh }: ServerTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pausingServers, setPausingServers] = useState<Set<string>>(new Set());
  const navigate = useNavigate();
  const { toast } = useToast();

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

  const handlePauseResume = async (server: Server) => {
    const serverId = server.id;
    const isPaused = server.status === "paused";
    
    if (pausingServers.has(serverId)) {
      return; // Already processing this server
    }

    try {
      setPausingServers(prev => new Set(prev).add(serverId));
      
      if (isPaused) {
        // Resume monitoring
        await pb.collection('servers').update(serverId, {
          status: "up",
          last_checked: new Date().toISOString()
        });
        
        toast({
          title: "Server resumed",
          description: `Monitoring resumed for ${server.name}`,
        });
        
        console.log(`Resume server monitoring: ${serverId}`);
      } else {
        // Pause monitoring
        await pb.collection('servers').update(serverId, {
          status: "paused",
          last_checked: new Date().toISOString()
        });
        
        toast({
          title: "Server paused",
          description: `Monitoring paused for ${server.name}`,
        });
        
        console.log(`Pause server monitoring: ${serverId}`);
      }
      
      // Refresh the server list to show updated status
      onRefresh();
      
    } catch (error) {
      console.error('Error updating server status:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${isPaused ? 'resume' : 'pause'} server monitoring. Please try again.`,
      });
    } finally {
      setPausingServers(prev => {
        const newSet = new Set(prev);
        newSet.delete(serverId);
        return newSet;
      });
    }
  };

  const handleEdit = (serverId: string) => {
    // TODO: Implement edit functionality
    console.log('Edit server:', serverId);
  };

  const handleDelete = (server: Server) => {
    setSelectedServer(server);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedServer || isDeleting) return;

    try {
      setIsDeleting(true);
      
      // Delete the server from the database
      await pb.collection('servers').delete(selectedServer.id);
      
      toast({
        title: "Server deleted",
        description: `${selectedServer.name} has been deleted successfully.`,
      });
      
      // Refresh the server list
      onRefresh();
      
      // Close the dialog
      setDeleteDialogOpen(false);
      setSelectedServer(null);
      
    } catch (error) {
      console.error('Error deleting server:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete server. Please try again.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="flex-1 flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle>Servers</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading servers...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="flex-1 flex flex-col min-h-0">
        <CardHeader className="flex-shrink-0">
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
        <CardContent className="flex-1 flex flex-col min-h-0 p-0">
          {filteredServers.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <p className="text-muted-foreground">No servers found</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-auto border-t">
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-10">
                    <TableRow>
                      <TableHead className="w-[150px] min-w-[120px]">Name</TableHead>
                      <TableHead className="w-[100px] min-w-[80px]">Status</TableHead>
                      <TableHead className="w-[100px] min-w-[80px]">OS</TableHead>
                      <TableHead className="w-[120px] min-w-[100px]">IP Address</TableHead>
                      <TableHead className="w-[140px] min-w-[120px]">CPU</TableHead>
                      <TableHead className="w-[140px] min-w-[120px]">Memory</TableHead>
                      <TableHead className="w-[140px] min-w-[120px]">Disk</TableHead>
                      <TableHead className="w-[100px] min-w-[80px]">Uptime</TableHead>
                      <TableHead className="w-[150px] min-w-[130px]">Last Checked</TableHead>
                      <TableHead className="w-[80px] min-w-[60px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredServers.map((server) => {
                      const cpuUsage = server.cpu_usage || 0;
                      const memoryUsage = server.ram_total > 0 ? (server.ram_used / server.ram_total) * 100 : 0;
                      const diskUsage = server.disk_total > 0 ? (server.disk_used / server.disk_total) * 100 : 0;
                      const isPaused = server.status === "paused";
                      const isProcessing = pausingServers.has(server.id);

                      return (
                        <TableRow key={server.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">
                            <div className="truncate max-w-[140px]" title={server.name}>
                              {server.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <ServerStatusBadge status={server.status} />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <OSTypeIcon osType={server.os_type} />
                              <span className="text-sm truncate max-w-[60px]" title={server.os_type}>
                                {server.os_type}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <code className="text-sm bg-muted px-1 py-0.5 rounded text-xs">
                              {server.ip_address}
                            </code>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1 min-w-[120px]">
                              <div className="flex justify-between text-sm">
                                <span>{cpuUsage.toFixed(1)}%</span>
                                <span className="text-muted-foreground text-xs">{server.cpu_cores} cores</span>
                              </div>
                              <Progress 
                                value={cpuUsage} 
                                className="h-2"
                                indicatorClassName={
                                  cpuUsage > 90 ? "bg-red-500" : 
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
                                <span className="text-xs">{serverService.formatBytes(server.ram_total)}</span>
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
                                <span className="text-xs">{serverService.formatBytes(server.disk_total)}</span>
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
                            <div className="text-sm truncate max-w-[80px]" title={server.uptime}>
                              {server.uptime}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground text-xs">
                              {new Date(server.last_checked).toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0" disabled={isProcessing}>
                                  <span className="sr-only">Open menu</span>
                                  {isProcessing ? (
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <MoreHorizontal className="h-4 w-4" />
                                  )}
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
                                <DropdownMenuItem 
                                  onClick={() => handlePauseResume(server)}
                                  disabled={isProcessing}
                                >
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
                                  onClick={() => handleDelete(server)}
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this server?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{' '}
              <span className="font-semibold text-foreground">
                {selectedServer?.name}
              </span>{' '}
              and all of its monitoring data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};