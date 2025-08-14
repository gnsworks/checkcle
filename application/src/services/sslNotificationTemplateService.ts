
import { pb } from "@/lib/pocketbase";

export interface SslNotificationTemplate {
  id: string;
  collectionId: string;
  collectionName: string;
  name: string;
  expired: string;
  exiring_soon: string;
  warning: string;
  placeholder: string;
  created: string;
  updated: string;
}

export interface CreateUpdateSslNotificationTemplateData {
  name: string;
  expired: string;
  exiring_soon: string;
  warning: string;
  placeholder: string;
}

export const sslNotificationTemplateService = {
  async getTemplates(): Promise<SslNotificationTemplate[]> {
    try {
    //  console.log("Fetching SSL notification templates");
      const response = await pb.collection('ssl_notification_templates').getList(1, 50, {
        sort: '-created',
      });
    //  console.log("SSL notification templates response:", response);
      return response.items as unknown as SslNotificationTemplate[];
    } catch (error) {
    //  console.error("Error fetching SSL notification templates:", error);
      throw error;
    }
  },

  async getTemplate(id: string): Promise<SslNotificationTemplate> {
    try {
     // console.log(`Fetching SSL notification template with id: ${id}`);
      const response = await pb.collection('ssl_notification_templates').getOne(id);
    //  console.log("SSL notification template response:", response);
      return response as unknown as SslNotificationTemplate;
    } catch (error) {
    //  console.error(`Error fetching SSL notification template with id ${id}:`, error);
      throw error;
    }
  },

  async createTemplate(data: CreateUpdateSslNotificationTemplateData): Promise<SslNotificationTemplate> {
    try {
     // console.log("Creating new SSL notification template with data:", data);
      const response = await pb.collection('ssl_notification_templates').create(data);
     // console.log("Create SSL notification template response:", response);
      return response as unknown as SslNotificationTemplate;
    } catch (error) {
     // console.error("Error creating SSL notification template:", error);
      throw error;
    }
  },

  async updateTemplate(id: string, data: Partial<CreateUpdateSslNotificationTemplateData>): Promise<SslNotificationTemplate> {
    try {
    //  console.log(`Updating SSL notification template with id: ${id}`, data);
      const response = await pb.collection('ssl_notification_templates').update(id, data);
    //  console.log("Update SSL notification template response:", response);
      return response as unknown as SslNotificationTemplate;
    } catch (error) {
    //  console.error(`Error updating SSL notification template with id ${id}:`, error);
      throw error;
    }
  },

  async deleteTemplate(id: string): Promise<boolean> {
    try {
     // console.log(`Deleting SSL notification template with id: ${id}`);
      await pb.collection('ssl_notification_templates').delete(id);
     // console.log("SSL notification template deleted successfully");
      return true;
    } catch (error) {
    //  console.error(`Error deleting SSL notification template with id ${id}:`, error);
      throw error;
    }
  }
};