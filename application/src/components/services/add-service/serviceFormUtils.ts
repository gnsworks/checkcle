
import { Service } from "@/types/service.types";
import { ServiceFormData } from "./types";

export const getServiceFormDefaults = (): ServiceFormData => ({
  name: "",
  type: "http",
  url: "",
  port: "",
  interval: "60",
  retries: "3",
  notificationStatus: "disabled",
  notificationChannels: [],
  alertTemplate: "",
  regionalMonitoringEnabled: false,
  regionalAgent: "",
});

export const mapServiceToFormData = (service: Service): ServiceFormData => {
  // Ensure the type is one of the allowed values
  const serviceType = (service.type || "http").toLowerCase();
  const validType = ["http", "ping", "tcp", "dns"].includes(serviceType) 
    ? serviceType as "http" | "ping" | "tcp" | "dns"
    : "http";

  // For PING services, use host field; for DNS use domain field; for TCP use host field; others use url
  let urlValue = "";
  let portValue = "";
  
  if (validType === "ping") {
    urlValue = service.host || "";
  } else if (validType === "dns") {
    urlValue = service.domain || "";
  } else if (validType === "tcp") {
    urlValue = service.host || "";
    portValue = String(service.port || "");
  } else {
    urlValue = service.url || "";
  }

  // Handle regional monitoring data - check regional_status field
  const isRegionalEnabled = service.regional_status === "enabled";
  const regionalAgent = isRegionalEnabled && service.region_name && service.agent_id 
    ? `${service.region_name}|${service.agent_id}` 
    : "";

  // Handle notification channels - convert notification_channel and notificationChannel to array
  const notificationChannels: string[] = [];
  
  // Check for notification_channel field (from database)
  if (service.notification_channel) {
    notificationChannels.push(service.notification_channel);
  }
  
  // Also check for notificationChannel field (backward compatibility)
  if (service.notificationChannel && !notificationChannels.includes(service.notificationChannel)) {
    notificationChannels.push(service.notificationChannel);
  }

  console.log("Mapping service to form data:", {
    serviceName: service.name,
    notification_status: service.notification_status,
    notification_channel: service.notification_channel,
    notificationChannel: service.notificationChannel,
    mappedChannels: notificationChannels
  });

  return {
    name: service.name || "",
    type: validType,
    url: urlValue,
    port: portValue,
    interval: String(service.interval || 60),
    retries: String(service.retries || 3),
    notificationStatus: service.notification_status || "disabled",
    notificationChannels: notificationChannels,
    alertTemplate: service.alertTemplate === "default" ? "" : service.alertTemplate || "",
    regionalMonitoringEnabled: isRegionalEnabled,
    regionalAgent: regionalAgent,
  };
};

export const mapFormDataToServiceData = (data: ServiceFormData) => {
  // Parse regional agent selection
  let regionName = "";
  let agentId = "";
  let regionalStatus: "enabled" | "disabled" = "disabled";
  
  // Set regional status and agent data based on form values
  if (data.regionalMonitoringEnabled) {
    regionalStatus = "enabled";
    if (data.regionalAgent && data.regionalAgent !== "") {
      const [parsedRegionName, parsedAgentId] = data.regionalAgent.split("|");
      regionName = parsedRegionName || "";
      agentId = parsedAgentId || "";
    }
  }
  
  // Prepare service data with proper field mapping
  return {
    name: data.name,
    type: data.type,
    interval: parseInt(data.interval),
    retries: parseInt(data.retries),
    notificationStatus: data.notificationStatus || "disabled",
    notificationChannels: data.notificationChannels || [],
    alertTemplate: data.alertTemplate === "default" ? "" : data.alertTemplate,
    // Use regional_status field instead of regionalMonitoringEnabled
    regionalStatus: regionalStatus,
    regionName: regionName,
    agentId: agentId,
    // Map the URL field to appropriate database field based on service type
    ...(data.type === "dns" 
      ? { domain: data.url, url: "", host: "", port: undefined }  // DNS: store in domain field
      : data.type === "ping"
      ? { host: data.url, url: "", domain: "", port: undefined }  // PING: store in host field  
      : data.type === "tcp"
      ? { host: data.url, port: parseInt(data.port || "80"), url: "", domain: "" }  // TCP: store in host and port fields
      : { url: data.url, domain: "", host: "", port: undefined }  // HTTP: store in url field
    )
  };
};