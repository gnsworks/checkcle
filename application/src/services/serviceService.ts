
import { pb } from '@/lib/pocketbase';
import { Service, CreateServiceParams, UptimeData } from '@/types/service.types';
import { monitoringService } from './monitoring';
import { uptimeService } from './uptimeService';

export type { Service, UptimeData, CreateServiceParams };

export const serviceService = {
  async getServices(): Promise<Service[]> {
    try {
      
      // First get the total count of records
      const countResponse = await pb.collection('services').getList(1, 1, {
        sort: 'name',
      });
      const totalRecords = countResponse.totalItems;
      
      // Then fetch all records using the total count as the limit
      const response = await pb.collection('services').getList(1, totalRecords, {
        sort: 'name',
      });
      
      return response.items.map(item => ({
        id: item.id,
        name: item.name,
        url: item.url || "",  // Ensure proper URL mapping
        host: item.host || "",  // Map host field for PING and TCP services
        port: item.port || undefined,  // Map port field for TCP services
        domain: item.domain || "",  // Map domain field
        type: item.service_type || item.type || "HTTP",  // Map service_type to type
        status: item.status || "paused",
        responseTime: item.response_time || item.responseTime || 0,
        uptime: item.uptime || 0,
        lastChecked: item.last_checked || item.lastChecked || new Date().toLocaleString(),
        interval: item.heartbeat_interval || item.interval || 60,
        retries: item.max_retries || item.retries || 3,
        notificationChannel: item.notification_id,
        notification_channel: item.notification_channel, // Add this field for multiple channels support
        notification_status: item.notification_status || "disabled",
        alertTemplate: item.template_id,
        muteAlerts: item.alerts === "muted",  // Convert string to boolean for compatibility
        alerts: item.alerts || "unmuted",     // Store actual database field
        muteChangedAt: item.mute_changed_at,
        // Regional monitoring fields - use regional_status
        region_name: item.region_name || "",
        agent_id: item.agent_id || "",
        regional_status: item.regional_status || "disabled",
        regional_monitoring_enabled: item.regional_status === "enabled", // Backward compatibility
      }));
    } catch (error) {
    //  console.error("Error fetching services:", error);
      throw new Error('Failed to load services data.');
    }
  },

  async createService(params: any): Promise<Service> {
    try {
      // Convert service type to lowercase to avoid validation issues
      const serviceType = params.type.toLowerCase();
      
      // Debug log to check what we're sending
     // console.log("Creating service with params:", params);
      
      const data = {
        name: params.name,
        service_type: serviceType,  // Using lowercase value to avoid validation errors
        status: "up", // Changed from "active" to "up" to match the expected enum values
        response_time: 0,
        uptime: 0,
        last_checked: new Date().toLocaleString(),
        heartbeat_interval: params.interval,
        max_retries: params.retries,
        notification_status: params.notificationStatus || "disabled",
        // Store multiple notification channels as JSON string
        notification_channel: params.notificationChannels && params.notificationChannels.length > 0 
          ? JSON.stringify(params.notificationChannels)
          : null,
        // Store multiple notification IDs as comma-separated string in notification_id field
        notification_id: params.notificationChannels && params.notificationChannels.length > 0 
          ? params.notificationChannels.join(',')
          : null,
        template_id: params.alertTemplate,
        // Regional monitoring fields - use regional_status
        regional_status: params.regionalStatus || "disabled",
        region_name: params.regionName || "",
        agent_id: params.agentId || "",
        // Conditionally add fields based on service type
        ...(serviceType === "dns" 
          ? { domain: params.domain, url: "", host: "", port: null }  // DNS: store in domain field
          : serviceType === "ping"
          ? { host: params.host, url: "", domain: "", port: null }    // PING: store in host field
          : serviceType === "tcp"
          ? { host: params.host, port: params.port, url: "", domain: "" }  // TCP: store in host and port fields
          : { url: params.url, domain: "", host: "", port: null }     // HTTP: store in url field
        )
      };

     // console.log("Creating service with data:", data);
      const record = await pb.collection('services').create(data);
     // console.log("Service created, returned record:", record);
      
      // Return the newly created service
      const newService = {
        id: record.id,
        name: record.name,
        url: record.url || "",
        host: record.host || "",
        port: record.port || undefined,
        domain: record.domain || "",
        type: record.service_type || "http",
        status: record.status || "up", // Changed to match the status we set
        responseTime: record.response_time || 0,
        uptime: record.uptime || 0,
        lastChecked: record.last_checked || new Date().toLocaleString(),
        interval: record.heartbeat_interval || 60,
        retries: record.max_retries || 3,
        notificationChannel: record.notification_id,
        notification_channel: record.notification_channel,
        notification_status: record.notification_status || "disabled",
        alertTemplate: record.template_id,
        regional_status: record.regional_status || "disabled",
        regional_monitoring_enabled: record.regional_status === "enabled",
        region_name: record.region_name || "",
        agent_id: record.agent_id || "",
      } as Service;
      
      // Immediately start monitoring for the new service
      await monitoringService.startMonitoringService(record.id);
      
      return newService;
    } catch (error) {
    //  console.error("Error creating service:", error);
      throw new Error('Failed to create service.');
    }
  },
  
  async updateService(id: string, params: any): Promise<Service> {
    try {
      // Convert service type to lowercase to avoid validation issues
      const serviceType = params.type.toLowerCase();
      
      // Debug log to check what we're updating
    //  console.log("Updating service with params:", params);
      
      const data = {
        name: params.name,
        service_type: serviceType,
        heartbeat_interval: params.interval,
        max_retries: params.retries,
        notification_status: params.notificationStatus || "disabled",
        // Store multiple notification channels as JSON string
        notification_channel: params.notificationChannels && params.notificationChannels.length > 0 
          ? JSON.stringify(params.notificationChannels)
          : null,
        // Store multiple notification IDs as comma-separated string in notification_id field
        notification_id: params.notificationChannels && params.notificationChannels.length > 0 
          ? params.notificationChannels.join(',')
          : null,
        template_id: params.alertTemplate || null,
        // Regional monitoring fields - use regional_status
        regional_status: params.regionalStatus || "disabled",
        region_name: params.regionName || "",
        agent_id: params.agentId || "",
        // Conditionally update fields based on service type
        ...(serviceType === "dns" 
          ? { domain: params.domain, url: "", host: "", port: null }  // DNS: update domain field
          : serviceType === "ping"
          ? { host: params.host, url: "", domain: "", port: null }    // PING: update host field
          : serviceType === "tcp"
          ? { host: params.host, port: params.port, url: "", domain: "" }  // TCP: update host and port fields
          : { url: params.url, domain: "", host: "", port: null }     // HTTP: update url field
        )
      };

     // console.log("Updating service with data:", data);
      
      // Use timeout to ensure the request doesn't hang
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Request timed out")), 10000);
      });
      
      const updatePromise = pb.collection('services').update(id, data);
      const record = await Promise.race([updatePromise, timeoutPromise]) as any;
     // console.log("Service updated, returned record:", record);
      
      // Return the updated service
      const updatedService = {
        id: record.id,
        name: record.name,
        url: record.url || "",
        host: record.host || "",
        port: record.port || undefined,
        domain: record.domain || "",
        type: record.service_type || "http",
        status: record.status,
        responseTime: record.response_time || 0,
        uptime: record.uptime || 0,
        lastChecked: record.last_checked || new Date().toLocaleString(),
        interval: record.heartbeat_interval || 60,
        retries: record.max_retries || 3,
        notificationChannel: record.notification_id,
        notification_channel: record.notification_channel,
        notification_status: record.notification_status || "disabled",
        alertTemplate: record.template_id,
        regional_status: record.regional_status || "disabled",
        regional_monitoring_enabled: record.regional_status === "enabled",
        region_name: record.region_name || "",
        agent_id: record.agent_id || "",
      } as Service;
      
      return updatedService;
    } catch (error) {
      //console.error("Error updating service:", error);
      throw new Error(`Failed to update service: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
  
  // Control service monitoring
  startMonitoringService: monitoringService.startMonitoringService,
  pauseMonitoring: monitoringService.pauseMonitoring,
  resumeMonitoring: monitoringService.resumeMonitoring,
  startAllActiveServices: monitoringService.startAllActiveServices,
  
  // Re-export uptime functions
  recordUptimeData: uptimeService.recordUptimeData,
  getUptimeHistory: uptimeService.getUptimeHistory
};