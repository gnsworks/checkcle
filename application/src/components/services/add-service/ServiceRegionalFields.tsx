
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { ServiceFormData } from "./types";
import { useQuery } from "@tanstack/react-query";
import { regionalService } from "@/services/regionalService";
import { MapPin, Loader2, X, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ServiceRegionalFieldsProps {
  form: UseFormReturn<ServiceFormData>;
}

export function ServiceRegionalFields({ form }: ServiceRegionalFieldsProps) {
  const regionalMonitoringEnabled = form.watch("regionalMonitoringEnabled");
  const currentRegionalAgents = form.watch("regionalAgents") || [];

  const { data: regionalAgents = [], isLoading } = useQuery({
    queryKey: ['regional-services'],
    queryFn: regionalService.getRegionalServices,
    enabled: regionalMonitoringEnabled,
  });

  // Filter only online agents and exclude the default localhost agent (ID 1)
  const onlineAgents = regionalAgents.filter(agent => 
    agent.connection === 'online' && agent.agent_id !== "1"
  );

  // Get available agents (not already selected)
  const availableAgents = onlineAgents.filter(agent => 
    !currentRegionalAgents.includes(`${agent.region_name}|${agent.agent_id}`)
  );

  // Get agent display name
  const getAgentDisplayName = (agentValue: string) => {
    const [regionName, agentId] = agentValue.split("|");
    const agent = onlineAgents.find(agent => 
      `${agent.region_name}|${agent.agent_id}` === agentValue
    );
    
    if (agent) {
      return `${agent.region_name} (${agent.agent_ip_address})`;
    }
    
    // If agent is not found in online agents, it might be offline but still assigned
    if (regionName && agentId) {
      return `${regionName} (Agent ${agentId}) - Offline`;
    }
    
    return agentValue;
  };

  // Add regional agent
  const addRegionalAgent = (agentValue: string) => {
    if (agentValue && agentValue !== "select") {
      const currentAgents = form.getValues("regionalAgents") || [];
      if (!currentAgents.includes(agentValue)) {
        form.setValue("regionalAgents", [...currentAgents, agentValue]);
      }
    }
  };

  // Remove regional agent
  const removeRegionalAgent = (agentValue: string) => {
    const currentAgents = form.getValues("regionalAgents") || [];
    form.setValue("regionalAgents", currentAgents.filter(agent => agent !== agentValue));
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
                Assign this service to regional monitoring agents for distributed monitoring
              </div>
            </div>
            <FormControl>
              <Switch
                checked={field.value || false}
                onCheckedChange={(checked) => {
                  field.onChange(checked);
                  // Clear agents when disabling regional monitoring
                  if (!checked) {
                    form.setValue("regionalAgents", []);
                  }
                }}
              />
            </FormControl>
          </FormItem>
        )}
      />

      {regionalMonitoringEnabled && (
        <FormField
          control={form.control}
          name="regionalAgents"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Regional Agents</FormLabel>
              
              {/* Display selected agents */}
              {currentRegionalAgents.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {currentRegionalAgents.map((agentValue) => (
                    <Badge key={agentValue} variant="secondary" className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">{getAgentDisplayName(agentValue)}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-1"
                        onClick={() => removeRegionalAgent(agentValue)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Add new agent selector */}
              <Select 
                onValueChange={addRegionalAgent}
                value="select"
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={
                      isLoading 
                        ? "Loading agents..." 
                        : availableAgents.length > 0 
                          ? "Select additional regional agents..."
                          : currentRegionalAgents.length > 0 
                            ? "All available agents selected"
                            : "No regional agents available"
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
                  ) : availableAgents.length === 0 ? (
                    <SelectItem value="no-agents" disabled>
                      {currentRegionalAgents.length > 0 
                        ? "All available agents selected"
                        : "No online regional agents available"
                      }
                    </SelectItem>
                  ) : (
                    <>
                      <SelectItem value="select" disabled>
                        <div className="flex items-center gap-2">
                          <Plus className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Select an agent to add...</span>
                        </div>
                      </SelectItem>
                      {availableAgents.map((agent) => (
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
              
              <FormMessage />
              
              {regionalMonitoringEnabled && onlineAgents.length === 0 && !isLoading && (
                <p className="text-sm text-amber-600">
                  No online regional agents found. Services will use default monitoring.
                </p>
              )}
              
              {currentRegionalAgents.length === 0 && regionalMonitoringEnabled && (
                <p className="text-sm text-orange-600">
                  No regional agents selected. Service will use default monitoring.
                </p>
              )}
              
              {currentRegionalAgents.length > 0 && (
                <p className="text-sm text-green-600">
                  Service assigned to {currentRegionalAgents.length} regional agent{currentRegionalAgents.length > 1 ? 's' : ''}.
                </p>
              )}
            </FormItem>
          )}
        />
      )}
    </div>
  );
}