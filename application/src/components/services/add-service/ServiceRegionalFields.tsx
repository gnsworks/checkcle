
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { ServiceFormData } from "./types";
import { useQuery } from "@tanstack/react-query";
import { regionalService } from "@/services/regionalService";
import { MapPin, Loader2, X } from "lucide-react";

interface ServiceRegionalFieldsProps {
  form: UseFormReturn<ServiceFormData>;
}

export function ServiceRegionalFields({ form }: ServiceRegionalFieldsProps) {
  const regionalMonitoringEnabled = form.watch("regionalMonitoringEnabled");
  const currentRegionalAgent = form.watch("regionalAgent");

  const { data: regionalAgents = [], isLoading } = useQuery({
    queryKey: ['regional-services'],
    queryFn: regionalService.getRegionalServices,
    enabled: regionalMonitoringEnabled,
  });

  // Filter only online agents and exclude the default localhost agent (ID 1)
  const onlineAgents = regionalAgents.filter(agent => 
    agent.connection === 'online' && agent.agent_id !== "1"
  );

  // Find the current agent name for display
  const getCurrentAgentDisplay = () => {
    if (!currentRegionalAgent || currentRegionalAgent === "unassign") {
      return "Select a regional agent or unassign";
    }
    
    const [regionName, agentId] = currentRegionalAgent.split("|");
    const agent = onlineAgents.find(agent => 
      `${agent.region_name}|${agent.agent_id}` === currentRegionalAgent
    );
    
    if (agent) {
      return `${agent.region_name} (${agent.agent_ip_address})`;
    }
    
    // If agent is not found in online agents, it might be offline but still assigned
    // Show the region name from the stored value
    if (regionName && agentId) {
      return `${regionName} (Agent ${agentId}) - Offline`;
    }
    
    return "Select a regional agent or unassign";
  };

  // Get the proper select value - handle both assigned and unassigned cases
  const getSelectValue = () => {
    if (!regionalMonitoringEnabled) {
      return "unassign";
    }
    
    if (!currentRegionalAgent || currentRegionalAgent === "") {
      return "unassign";
    }
    
    return currentRegionalAgent;
  };

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="regionalMonitoringEnabled"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Regional Monitoring
              </FormLabel>
              <div className="text-sm text-muted-foreground">
                Assign this service to a regional monitoring agent for distributed monitoring
              </div>
            </div>
            <FormControl>
              <Switch
                checked={field.value || false}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />

      {regionalMonitoringEnabled && (
        <FormField
          control={form.control}
          name="regionalAgent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Regional Agent</FormLabel>
              <Select 
                onValueChange={(value) => {
                  // Handle the unassign case by setting to empty string
                  field.onChange(value === "unassign" ? "" : value);
                }} 
                value={getSelectValue()}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={
                      isLoading 
                        ? "Loading agents..." 
                        : getCurrentAgentDisplay()
                    } />
                  </SelectTrigger>
                </FormControl>
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
                      <SelectItem value="unassign">
                        <div className="flex items-center gap-2">
                          <X className="h-4 w-4 text-red-500" />
                          <span className="text-red-600">Unassign (No Regional Agent)</span>
                        </div>
                      </SelectItem>
                      {onlineAgents.length === 0 ? (
                        <SelectItem value="no-agents" disabled>
                          No online regional agents available
                        </SelectItem>
                      ) : (
                        onlineAgents.map((agent) => (
                          <SelectItem key={agent.id} value={`${agent.region_name}|${agent.agent_id}`}>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="font-medium">{agent.region_name}</span>
                              <span className="text-muted-foreground">({agent.agent_ip_address})</span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
              {regionalMonitoringEnabled && onlineAgents.length === 0 && !isLoading && (
                <p className="text-sm text-amber-600">
                  No online regional agents found. Services will use default monitoring.
                </p>
              )}
              {currentRegionalAgent && currentRegionalAgent !== "" && (
                <p className="text-sm text-green-600">
                  Currently assigned to: {getCurrentAgentDisplay()}
                </p>
              )}
              {(!currentRegionalAgent || currentRegionalAgent === "") && regionalMonitoringEnabled && (
                <p className="text-sm text-orange-600">
                  Service is unassigned and will use default monitoring.
                </p>
              )}
            </FormItem>
          )}
        />
      )}
    </div>
  );
}