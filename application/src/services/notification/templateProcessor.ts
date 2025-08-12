
import { AnyTemplate } from "../templateService";

/**
 * Process a notification template with service data
 */
export function processTemplate(
  template: AnyTemplate,
  service: any,
  status: string,
  responseTime?: number
): string {
  try {
    
    let templateText = "";
    
    // Select the appropriate message template based on status
    if (status === "up") {
      templateText = (template as any).up_message || generateDefaultUptimeMessage(service, status, responseTime);
    } else if (status === "down") {
      templateText = (template as any).down_message || generateDefaultUptimeMessage(service, status, responseTime);
    } else if (status === "warning") {
      templateText = (template as any).incident_message || generateDefaultUptimeMessage(service, status, responseTime);
    } else if (status === "maintenance" || status === "paused") {
      templateText = (template as any).maintenance_message || generateDefaultUptimeMessage(service, status, responseTime);
    } else if (status === "resolved") {
      templateText = (template as any).resolved_message || generateDefaultUptimeMessage(service, status, responseTime);
    } else {
      templateText = generateDefaultUptimeMessage(service, status, responseTime);
    }
    
    // Skip replacement if template is empty
    if (!templateText) {
      return generateDefaultUptimeMessage(service, status, responseTime);
    }
        
    // Replace placeholders with actual values
    let message = templateText
      .replace(/\${service_name}/g, service.name || 'Unknown Service')
      .replace(/\${status}/g, status.toUpperCase());
    
    // Add response time if available
    if (responseTime !== undefined) {
      message = message.replace(/\${response_time}/g, `${responseTime}ms`);
    } else {
      message = message.replace(/\${response_time}/g, 'N/A');
    }
    
    // Replace service-specific placeholders
    message = message
      .replace(/\${url}/g, service.url || service.URL || 'N/A')
      .replace(/\${host}/g, service.host || service.Host || 'N/A')
      .replace(/\${service_type}/g, service.service_type?.toUpperCase() || service.ServiceType?.toUpperCase() || service.type?.toUpperCase() || 'N/A')
      .replace(/\${port}/g, service.port ? service.port.toString() : (service.Port ? service.Port.toString() : 'N/A'))
      .replace(/\${domain}/g, service.domain || service.Domain || 'N/A')
      .replace(/\${region_name}/g, service.region_name || service.RegionName || 'Default')
      .replace(/\${agent_id}/g, service.agent_id ? service.agent_id.toString() : (service.AgentID ? service.AgentID.toString() : '1'))
      .replace(/\${uptime}/g, service.uptime ? `${service.uptime}%` : (service.Uptime ? `${service.Uptime}%` : 'N/A'))
      .replace(/\${time}/g, new Date().toLocaleString());
      
    return message;
  } catch (error) {
    return generateDefaultUptimeMessage(service, status, responseTime);
  }
}

/**
 * Generate a default uptime message with proper formatting and emojis
 */
export function generateDefaultUptimeMessage(
  service: any,
  status: string,
  responseTime?: number
): string {
  const serviceName = service.name || service.Name || 'Unknown Service';
  const statusUpper = status.toUpperCase();
  
  // Status emoji mapping
  let statusEmoji = "🔵";
  if (status === "up") {
    statusEmoji = "🟢";
  } else if (status === "down") {
    statusEmoji = "🔴";
  } else if (status === "warning") {
    statusEmoji = "🟡";
  } else if (status === "maintenance" || status === "paused") {
    statusEmoji = "🟠";
  }
  
  let message = `${statusEmoji}Service ${serviceName} is ${statusUpper}.`;
  
  // Add service details
  const host = service.host || service.Host;
  const url = service.url || service.URL;
  const serviceType = service.service_type || service.ServiceType || service.type;
  const port = service.port || service.Port;
  const domain = service.domain || service.Domain;
  const regionName = service.region_name || service.RegionName;
  const agentId = service.agent_id || service.AgentID;
  const uptime = service.uptime || service.Uptime;
  
  // Build formatted details
  const details = [];
  
  if (url && url !== 'N/A') {
    details.push(` - Host URL: ${url}`);
  } else if (host && host !== 'N/A') {
    details.push(` - Host: ${host}`);
  }
  
  if (serviceType && serviceType !== 'N/A') {
    details.push(` - Type: ${serviceType.toUpperCase()}`);
  }
  
  if (port && port !== 'N/A') {
    details.push(` - Port: ${port}`);
  }
  
  if (domain && domain !== 'N/A') {
    details.push(` - Domain: ${domain}`);
  }
  
  // Response time handling
  if (responseTime !== undefined && responseTime > 0) {
    details.push(` - Response time: ${responseTime}ms`);
  } else {
    details.push(` - Response time: N/A`);
  }
  
  if (regionName && regionName !== 'N/A') {
    details.push(` - Region: ${regionName}`);
  }
  
  if (agentId && agentId !== 'N/A') {
    details.push(` - Agent: ${agentId}`);
  }
  
  if (uptime !== undefined && uptime !== 'N/A') {
    details.push(` - Uptime: ${uptime}%`);
  }
  
  // Add timestamp
  details.push(` - Time: ${new Date().toLocaleString()}`);
  
  // Combine message with details
  if (details.length > 0) {
    message += '\n' + details.join('\n');
  }
  
  return message;
}

/**
 * Generate a default message when no template is available (legacy support)
 */
export function generateDefaultMessage(
  serviceName: string,
  status: string,
  responseTime?: number
): string {
  const statusText = status.toUpperCase();
  
  let message = `Service ${serviceName || 'Unknown'} is ${statusText}`;
  
  if (responseTime !== undefined) {
    message += `. Response time: ${responseTime}ms`;
  }
  
  message += `. Time: ${new Date().toLocaleString()}`;
  
  return message;
}