
import { useState, useEffect } from "react";
import { pb } from "@/lib/pocketbase";
import { Service, UptimeData } from "@/types/service.types";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { uptimeService } from "@/services/uptimeService";
import { DateRangeOption } from "../../DateRangeFilter";

export const useServiceData = (serviceId: string | undefined, startDate: Date, endDate: Date) => {
  const [service, setService] = useState<Service | null>(null);
  const [uptimeData, setUptimeData] = useState<UptimeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRegionalAgent, setSelectedRegionalAgent] = useState<string>("default");
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleStatusChange = async (newStatus: "up" | "down" | "paused" | "warning") => {
    if (!service || !serviceId) return;

    try {
      setService({ ...service, status: newStatus as Service["status"] });
      
      await pb.collection('services').update(serviceId, {
        status: newStatus
      });
      
      toast({
        title: "Status updated",
        description: `Service status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error("Failed to update service status:", error);
      setService(prevService => prevService);
      
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "Could not update service status. Please try again.",
      });
    }
  };

  const fetchUptimeData = async (serviceId: string, start: Date, end: Date, selectedRange?: DateRangeOption | string, regionalAgent?: string) => {
    try {
      if (!service) {
        console.log('No service data available for uptime fetch');
        return [];
      }

      const currentAgent = regionalAgent || selectedRegionalAgent;
      console.log(`Fetching uptime data: ${start.toISOString()} to ${end.toISOString()} for range: ${selectedRange}, service type: ${service.type}, regional agent: ${currentAgent}`);
      
      // Clear existing data immediately when switching agents
      setUptimeData([]);
      
      let limit = 500; // Default limit
      
      if (selectedRange === '24h') {
        limit = 300;
      } else if (selectedRange === '7d') {
        limit = 400;
      }
      
      console.log(`Using limit ${limit} for range ${selectedRange}`);
      
      let history: UptimeData[] = [];
      
      if (currentAgent === "default") {
        // Fetch default monitoring data - this will automatically filter out regional records
        console.log(`Fetching default monitoring data from ${service.type} collection`);
        history = await uptimeService.getUptimeHistory(serviceId, limit, start, end, service.type);
        console.log(`Retrieved ${history.length} default monitoring records`);
      } else {
        // Fetch regional agent specific data
        const [regionName, agentId] = currentAgent.split("|");
        console.log(`Fetching regional agent data for region: ${regionName}, agent: ${agentId} from ${service.type} collection`);
        history = await uptimeService.getUptimeHistoryByRegionalAgent(serviceId, limit, start, end, service.type, regionName, agentId);
        console.log(`Retrieved ${history.length} regional monitoring records`);
      }
      
      // Sort by timestamp (newest first)
      const filteredHistory = [...history].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      
      console.log(`Final dataset: ${filteredHistory.length} records for ${currentAgent === "default" ? "default" : "regional"} monitoring`);
      setUptimeData(filteredHistory);
      return filteredHistory;
    } catch (error) {
      console.error("Error fetching uptime data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load uptime history. Please try again.",
      });
      return [];
    }
  };

  const handleRegionalAgentChange = (agent: string) => {
    console.log(`Regional agent changed from ${selectedRegionalAgent} to: ${agent}`);
    
    // Clear data immediately when switching
    setUptimeData([]);
    setSelectedRegionalAgent(agent);
    
    // Refetch data with new agent selection
    if (serviceId && !isLoading && service) {
      console.log(`Refetching data for new agent: ${agent}`);
      fetchUptimeData(serviceId, startDate, endDate, '24h', agent);
    }
  };

  // Initial data loading
  useEffect(() => {
    const fetchServiceData = async () => {
      try {
        if (!serviceId) {
          setIsLoading(false);
          return;
        }
        
        setIsLoading(true);
        
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Request timed out")), 10000);
        });
        
        const fetchPromise = pb.collection('services').getOne(serviceId);
        const serviceData = await Promise.race([fetchPromise, timeoutPromise]) as any;
        
        const formattedService: Service = {
          id: serviceData.id,
          name: serviceData.name,
          url: serviceData.url || "",
          host: serviceData.host || "",
          port: serviceData.port || undefined,
          domain: serviceData.domain || "",
          type: serviceData.service_type || serviceData.type || "HTTP",
          status: serviceData.status || "paused",
          responseTime: serviceData.response_time || serviceData.responseTime || 0,
          uptime: serviceData.uptime || 0,
          lastChecked: serviceData.last_checked || serviceData.lastChecked || new Date().toLocaleString(),
          interval: serviceData.heartbeat_interval || serviceData.interval || 60,
          retries: serviceData.max_retries || serviceData.retries || 3,
          notificationChannel: serviceData.notification_id,
          alertTemplate: serviceData.template_id,
          alerts: serviceData.alerts || "unmuted"
        };
        
        console.log(`Loaded service: ${formattedService.name} (${formattedService.type})`);
        setService(formattedService);
        
        // Small delay to ensure state is updated before fetching uptime data
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error("Error fetching service:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load service data. Please try again.",
        });
        navigate("/dashboard");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchServiceData();
  }, [serviceId, navigate, toast]);

  // Update data when date range changes or when service is loaded
  useEffect(() => {
    if (serviceId && !isLoading && service) {
      console.log(`Date range changed or service loaded, refetching data for ${serviceId}: ${startDate.toISOString()} to ${endDate.toISOString()}`);
      fetchUptimeData(serviceId, startDate, endDate, '24h', selectedRegionalAgent);
    }
  }, [startDate, endDate, serviceId, isLoading, service, selectedRegionalAgent]);

  return {
    service,
    setService,
    uptimeData,
    setUptimeData,
    isLoading,
    handleStatusChange,
    fetchUptimeData,
    selectedRegionalAgent,
    handleRegionalAgentChange
  };
};