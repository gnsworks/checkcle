
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { regionalService } from "@/services/regionalService";
import { MapPin, Loader2, BarChart3 } from "lucide-react";

interface RegionalAgentFilterProps {
  selectedAgent: string;
  onAgentChange: (agent: string) => void;
}

export function RegionalAgentFilter({ selectedAgent, onAgentChange }: RegionalAgentFilterProps) {
  const { data: regionalAgents = [], isLoading } = useQuery({
    queryKey: ['regional-services'],
    queryFn: regionalService.getRegionalServices,
  });

  // Filter only online agents
  const onlineAgents = regionalAgents.filter(agent => agent.connection === 'online');

  const getCurrentAgentDisplay = () => {
    if (!selectedAgent || selectedAgent === "all") {
      return "All Monitoring";
    }
    
    const [regionName] = selectedAgent.split("|");
    const agent = onlineAgents.find(agent => 
      `${agent.region_name}|${agent.agent_id}` === selectedAgent
    );
    
    if (agent) {
      return `${agent.region_name} (${agent.agent_ip_address})`;
    }
    
    return regionName || "All Monitoring";
  };

  return (
    <div className="w-64">
      <label className="text-sm font-medium flex items-center gap-2 mb-2">
        <MapPin className="h-4 w-4" />
        Monitoring Source
      </label>
      <Select 
        onValueChange={onAgentChange} 
        value={selectedAgent || "all"}
        disabled={isLoading}
      >
        <SelectTrigger>
          <SelectValue placeholder={
            isLoading 
              ? "Loading agents..." 
              : getCurrentAgentDisplay()
          } />
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <SelectItem value="loading" disabled>
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading agents...
              </div>
            </SelectItem>
          ) : (
            <>
              <SelectItem value="all">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-purple-500" />
                  <span className="font-medium">All Monitoring</span>
                </div>
              </SelectItem>
              {onlineAgents.length > 0 && onlineAgents.map((agent) => (
                <SelectItem key={agent.id} value={`${agent.region_name}|${agent.agent_id}`}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-medium">{agent.region_name}</span>
                    <span className="text-muted-foreground">({agent.agent_ip_address})</span>
                  </div>
                </SelectItem>
              ))}
            </>
          )}
        </SelectContent>
      </Select>
      {onlineAgents.length === 0 && !isLoading && (
        <p className="text-xs text-amber-600 mt-1">
          No regional agents available. Using default monitoring only.
        </p>
      )}
    </div>
  );
}