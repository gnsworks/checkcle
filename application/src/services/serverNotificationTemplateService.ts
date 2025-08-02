
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
  placeholder: string;
}

export const serverNotificationTemplateService = {
  async getTemplates(): Promise<ServerNotificationTemplate[]> {
    try {
    //  console.log("Fetching server notification templates");
      const response = await pb.collection('server_notification_templates').getList(1, 50, {
        sort: '-created',
      });
    //  console.log("Server notification templates response:", response);
      return response.items as unknown as ServerNotificationTemplate[];
    } catch (error) {
    //  console.error("Error fetching server notification templates:", error);
      throw error;
    }
  },

  async getTemplate(id: string): Promise<ServerNotificationTemplate> {
    try {
    //  console.log(`Fetching server notification template with id: ${id}`);
      const response = await pb.collection('server_notification_templates').getOne(id);
    //  console.log("Server notification template response:", response);
      return response as unknown as ServerNotificationTemplate;
    } catch (error) {
    ///  console.error(`Error fetching server notification template with id ${id}:`, error);
      throw error;
    }
  },

  async createTemplate(data: CreateUpdateServerNotificationTemplateData): Promise<ServerNotificationTemplate> {
    try {
    //  console.log("Creating new server notification template with data:", data);
      const response = await pb.collection('server_notification_templates').create(data);
    //  console.log("Create server notification template response:", response);
      return response as unknown as ServerNotificationTemplate;
    } catch (error) {
    //  console.error("Error creating server notification template:", error);
      throw error;
    }
  },

  async updateTemplate(id: string, data: Partial<CreateUpdateServerNotificationTemplateData>): Promise<ServerNotificationTemplate> {
    try {
     // console.log(`Updating server notification template with id: ${id}`, data);
      const response = await pb.collection('server_notification_templates').update(id, data);
     // console.log("Update server notification template response:", response);
      return response as unknown as ServerNotificationTemplate;
    } catch (error) {
     // console.error(`Error updating server notification template with id ${id}:`, error);
      throw error;
    }
  },

  async deleteTemplate(id: string): Promise<boolean> {
    try {
     // console.log(`Deleting server notification template with id: ${id}`);
      await pb.collection('server_notification_templates').delete(id);
     // console.log("Server notification template deleted successfully");
      return true;
    } catch (error) {
     // console.error(`Error deleting server notification template with id ${id}:`, error);
      throw error;
    }
  }
};