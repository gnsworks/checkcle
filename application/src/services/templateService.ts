
import { pb } from "@/lib/pocketbase";
import { 
  serverNotificationTemplateService, 
  ServerNotificationTemplate,
  CreateUpdateServerNotificationTemplateData 
} from "./serverNotificationTemplateService";
import { 
  serviceNotificationTemplateService, 
  ServiceNotificationTemplate,
  CreateUpdateServiceNotificationTemplateData 
} from "./serviceNotificationTemplateService";
import { 
  sslNotificationTemplateService, 
  SslNotificationTemplate,
  CreateUpdateSslNotificationTemplateData 
} from "./sslNotificationTemplateService";
import { 
  serverThresholdService, 
  ServerThreshold,
  CreateUpdateServerThresholdData 
} from "./serverThresholdService";

export type TemplateType = 'server' | 'service' | 'ssl' | 'server_threshold';

export type AnyTemplate = ServerNotificationTemplate | ServiceNotificationTemplate | SslNotificationTemplate | ServerThreshold;
export type AnyTemplateData = CreateUpdateServerNotificationTemplateData | CreateUpdateServiceNotificationTemplateData | CreateUpdateSslNotificationTemplateData | CreateUpdateServerThresholdData;

// Export individual template types
export type { ServerNotificationTemplate, ServiceNotificationTemplate, SslNotificationTemplate, ServerThreshold };
export type { CreateUpdateServerNotificationTemplateData, CreateUpdateServiceNotificationTemplateData, CreateUpdateSslNotificationTemplateData, CreateUpdateServerThresholdData };

export const templateService = {
  async getTemplates(type: TemplateType): Promise<AnyTemplate[]> {
    switch (type) {
      case 'server':
        return serverNotificationTemplateService.getTemplates();
      case 'service':
        return serviceNotificationTemplateService.getTemplates();
      case 'ssl':
        return sslNotificationTemplateService.getTemplates();
      case 'server_threshold':
        return serverThresholdService.getServerThresholds();
      default:
        throw new Error(`Unknown template type: ${type}`);
    }
  },

  async getTemplate(id: string, type: TemplateType): Promise<AnyTemplate> {
    switch (type) {
      case 'server':
        return serverNotificationTemplateService.getTemplate(id);
      case 'service':
        return serviceNotificationTemplateService.getTemplate(id);
      case 'ssl':
        return sslNotificationTemplateService.getTemplate(id);
      case 'server_threshold':
        return serverThresholdService.getServerThreshold(id);
      default:
        throw new Error(`Unknown template type: ${type}`);
    }
  },

  async createTemplate(data: AnyTemplateData, type: TemplateType): Promise<AnyTemplate> {
    switch (type) {
      case 'server':
        return serverNotificationTemplateService.createTemplate(data as CreateUpdateServerNotificationTemplateData);
      case 'service':
        return serviceNotificationTemplateService.createTemplate(data as CreateUpdateServiceNotificationTemplateData);
      case 'ssl':
        return sslNotificationTemplateService.createTemplate(data as CreateUpdateSslNotificationTemplateData);
      case 'server_threshold':
        return serverThresholdService.createServerThreshold(data as CreateUpdateServerThresholdData);
      default:
        throw new Error(`Unknown template type: ${type}`);
    }
  },

  async updateTemplate(id: string, data: Partial<AnyTemplateData>, type: TemplateType): Promise<AnyTemplate> {
    switch (type) {
      case 'server':
        return serverNotificationTemplateService.updateTemplate(id, data as Partial<CreateUpdateServerNotificationTemplateData>);
      case 'service':
        return serviceNotificationTemplateService.updateTemplate(id, data as Partial<CreateUpdateServiceNotificationTemplateData>);
      case 'ssl':
        return sslNotificationTemplateService.updateTemplate(id, data as Partial<CreateUpdateSslNotificationTemplateData>);
      case 'server_threshold':
        return serverThresholdService.updateServerThreshold(id, data as Partial<CreateUpdateServerThresholdData>);
      default:
        throw new Error(`Unknown template type: ${type}`);
    }
  },

  async deleteTemplate(id: string, type: TemplateType): Promise<boolean> {
    switch (type) {
      case 'server':
        return serverNotificationTemplateService.deleteTemplate(id);
      case 'service':
        return serviceNotificationTemplateService.deleteTemplate(id);
      case 'ssl':
        return sslNotificationTemplateService.deleteTemplate(id);
      case 'server_threshold':
        return serverThresholdService.deleteServerThreshold(id);
      default:
        throw new Error(`Unknown template type: ${type}`);
    }
  }
};

// Template type configurations
export const templateTypeConfigs = {
  server: {
    label: 'Server Monitoring',
    description: 'Templates for server resource monitoring alerts',
    placeholders: [
      '${server_name}', '${cpu_usage}', '${ram_usage}', '${disk_usage}', 
      '${network_usage}', '${cpu_temp}', '${disk_io}', '${threshold}', '${time}'
    ]
  },
  service: {
    label: 'Service Uptime',
    description: 'Templates for service uptime monitoring alerts',
    placeholders: [
      '${service_name}', '${status}', '${response_time}', '${url}', 
      '${uptime}', '${downtime}', '${time}'
    ]
  },
  ssl: {
    label: 'SSL Certificate',
    description: 'Templates for SSL certificate monitoring alerts',
    placeholders: [
      '${domain}', '${certificate_name}', '${expiry_date}', '${days_left}', 
      '${issuer}', '${serial_number}', '${time}'
    ]
  },
  server_threshold: {
    label: 'Server Threshold',
    description: 'Templates for server resource threshold configurations',
    placeholders: [
      '${name}', '${cpu_threshold}', '${ram_threshold}', '${disk_threshold}', '${network_threshold}'
    ]
  }
};