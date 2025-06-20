
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MapPin, Wifi, WifiOff, MoreVertical, Trash2, Terminal, Copy } from "lucide-react";
import { RegionalService } from "@/types/regional.types";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface RegionalAgentCardProps {
  agent: RegionalService;
  onDelete: () => void;
}

export const RegionalAgentCard: React.FC<RegionalAgentCardProps> = ({ agent, onDelete }) => {
  const { toast } = useToast();

  const copyAgentId = async () => {
    try {
      await navigator.clipboard.writeText(agent.agent_id);
      toast({
        title: "Copied!",
        description: "Agent ID copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy agent ID.",
        variant: "destructive",
      });
    }
  };

  const getConnectionStatus = () => {
    if (agent.connection === 'online') {
      return {
        icon: <Wifi className="h-4 w-4" />,
        label: 'Online',
        variant: 'default' as const,
        className: 'bg-green-100 text-green-800 hover:bg-green-100'
      };
    } else {
      return {
        icon: <WifiOff className="h-4 w-4" />,
        label: 'Offline',
        variant: 'secondary' as const,
        className: 'bg-red-100 text-red-800 hover:bg-red-100'
      };
    }
  };

  const connectionStatus = getConnectionStatus();

  return (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            <div>
              <CardTitle className="text-lg">{agent.region_name}</CardTitle>
              <CardDescription className="flex items-center gap-1 text-sm">
                {agent.agent_ip_address}
              </CardDescription>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={copyAgentId}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Agent ID
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Remove Agent
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge 
            variant={connectionStatus.variant}
            className={connectionStatus.className}
          >
            {connectionStatus.icon}
            <span className="ml-1">{connectionStatus.label}</span>
          </Badge>
          
          <Badge variant="outline" className="text-xs">
            {agent.status}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Agent ID:</span>
            <span className="font-mono text-xs">{agent.agent_id.substring(0, 12)}...</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Last Updated:</span>
            <span className="text-xs">
              {formatDistanceToNow(new Date(agent.updated), { addSuffix: true })}
            </span>
          </div>
        </div>
        
        {agent.connection === 'online' && (
          <div className="pt-2 border-t">
            <div className="flex items-center text-xs text-green-600">
              <div className="w-2 h-2 bg-green-600 rounded-full mr-2 animate-pulse"></div>
              Active monitoring
            </div>
          </div>
        )}
        
        {agent.connection === 'offline' && (
          <div className="pt-2 border-t">
            <div className="flex items-center text-xs text-red-600">
              <div className="w-2 h-2 bg-red-600 rounded-full mr-2"></div>
              Connection lost
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};