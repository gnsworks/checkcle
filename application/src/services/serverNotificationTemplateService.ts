import { pb } from "@/lib/pocketbase";

export interface ServerNotificationTemplate {
  id: string;
  collectionId: string;
  collectionName: string;
  name: string;
  ram_message: string;
  cpu_message: string;
  disk_message: string;
  network_message: string;
  up_message: string;
  down_message: string;
  notification_id: string;
  warning_message: string;
  paused_message: string;
  cpu_temp_message: string;
  disk_io_message: string;
  restore_ram_message: string;
  restore_cpu_message: string;
  restore_disk_message: string;
  restore_network_message: string;
  restore_disk_io_message: string;
  restore_cpu_temp_message: string;
  placeholder: string;
  created: string;
  updated: string;
}

export interface CreateUpdateServerNotificationTemplateData {
  name: string;
  ram_message: string;
  cpu_message: string;
  disk_message: string;
  network_message: string;
  up_message: string;
  down_message: string;
  notification_id: string;
  warning_message: string;
  paused_message: string;
  cpu_temp_message: string;
  disk_io_message: string;
  restore_ram_message: string;
  restore_cpu_message: string;
  restore_disk_message: string;
  restore_network_message: string;
  restore_disk_io_message: string;
  restore_cpu_temp_message: string;
  placeholder: string;
}

export const serverNotificationTemplateService = {
  async getTemplates(): Promise<ServerNotificationTemplate[]> {
    try {
      
      const response = await pb.collection('server_notification_templates').getList(1, 50, {
        sort: '-created',
      });
     
      return response.items as unknown as ServerNotificationTemplate[];
    } catch (error) {
     
      throw error;
    }
  },

  async getTemplate(id: string): Promise<ServerNotificationTemplate> {
    try {
      
      const response = await pb.collection('server_notification_templates').getOne(id);
     
      return response as unknown as ServerNotificationTemplate;
    } catch (error) {
     
      throw error;
    }
  },

  async createTemplate(data: CreateUpdateServerNotificationTemplateData): Promise<ServerNotificationTemplate> {
    try {
    
      const response = await pb.collection('server_notification_templates').create(data);
    
      return response as unknown as ServerNotificationTemplate;
    } catch (error) {
     
      throw error;
    }
  },

  async updateTemplate(id: string, data: Partial<CreateUpdateServerNotificationTemplateData>): Promise<ServerNotificationTemplate> {
    try {
     
      const response = await pb.collection('server_notification_templates').update(id, data);
      
      return response as unknown as ServerNotificationTemplate;
    } catch (error) {
     
      throw error;
    }
  },

  async deleteTemplate(id: string): Promise<boolean> {
    try {

      await pb.collection('server_notification_templates').delete(id);

      return true;
    } catch (error) {
     
      throw error;
    }
  }
};