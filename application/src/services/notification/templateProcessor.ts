
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
   // console.log(`Processing template for status: ${status}`);
    
    let templateText = "";
    
    // Select the appropriate message template based on status
    if (status === "up") {
      templateText = (template as any).up_message || `Service ${service.name} is now UP`;
    } else if (status === "down") {
      templateText = (template as any).down_message || `Service ${service.name} is DOWN`;
    } else if (status === "warning") {
      templateText = (template as any).incident_message || `Warning: Service ${service.name} has an incident`;
    } else if (status === "maintenance" || status === "paused") {
      templateText = (template as any).maintenance_message || `Service ${service.name} is in maintenance mode`;
    } else if (status === "resolved") {
      templateText = (template as any).resolved_message || `Issue with service ${service.name} has been resolved`;
    } else {
      templateText = `Service ${service.name} status changed to: ${status}`;
    }
    
    // Skip replacement if template is empty
    if (!templateText) {
      return generateDefaultMessage(service.name, status, responseTime);
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
      .replace(/\${url}/g, service.url || 'N/A')
      .replace(/\${host}/g, service.host || 'N/A')
      .replace(/\${service_type}/g, service.type?.toUpperCase() || 'N/A')
      .replace(/\${port}/g, service.port ? service.port.toString() : 'N/A')
      .replace(/\${domain}/g, service.domain || 'N/A')
      .replace(/\${region_name}/g, service.region_name || 'Default')
      .replace(/\${agent_id}/g, service.agent_id ? service.agent_id.toString() : '1')
      .replace(/\${uptime}/g, service.uptime ? `${service.uptime}%` : 'N/A')
      .replace(/\${time}/g, new Date().toLocaleString());
      ;
    return message;
  } catch (error) {
    return generateDefaultMessage(service.name, status, responseTime);
  }
}

/**
 * Generate a default message when no template is available
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