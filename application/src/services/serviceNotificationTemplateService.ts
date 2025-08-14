
import { pb } from "@/lib/pocketbase";

export interface ServiceNotificationTemplate {
  id: string;
  collectionId: string;
  collectionName: string;
  name: string;
  up_message: string;
  down_message: string;
  maintenance_message: string;
  incident_message: string;
  resolved_message: string;
  placeholder: string;
  warning_message: string;
  created: string;
  updated: string;
}

export interface CreateUpdateServiceNotificationTemplateData {
  name: string;
  up_message: string;
  down_message: string;
  maintenance_message: string;
  incident_message: string;
  resolved_message: string;
  placeholder: string;
  warning_message: string;
}

export const serviceNotificationTemplateService = {
  async getTemplates(): Promise<ServiceNotificationTemplate[]> {
    try {
   //  console.log("Fetching service notification templates");
      const response = await pb.collection('service_notification_templates').getList(1, 50, {
        sort: '-created',
      });
    //  console.log("Service notification templates response:", response);
      return response.items as unknown as ServiceNotificationTemplate[];
    } catch (error) {
    //  console.error("Error fetching service notification templates:", error);
      throw error;
    }
  },

  async getTemplate(id: string): Promise<ServiceNotificationTemplate> {
    try {
     // console.log(`Fetching service notification template with id: ${id}`);
      const response = await pb.collection('service_notification_templates').getOne(id);
    //  console.log("Service notification template response:", response);
      return response as unknown as ServiceNotificationTemplate;
    } catch (error) {
    //  console.error(`Error fetching service notification template with id ${id}:`, error);
      throw error;
    }
  },

  async createTemplate(data: CreateUpdateServiceNotificationTemplateData): Promise<ServiceNotificationTemplate> {
    try {
     // console.log("Creating new service notification template with data:", data);
      const response = await pb.collection('service_notification_templates').create(data);
     // console.log("Create service notification template response:", response);
      return response as unknown as ServiceNotificationTemplate;
    } catch (error) {
    //  console.error("Error creating service notification template:", error);
      throw error;
    }
  },

  async updateTemplate(id: string, data: Partial<CreateUpdateServiceNotificationTemplateData>): Promise<ServiceNotificationTemplate> {
    try {
     // console.log(`Updating service notification template with id: ${id}`, data);
      const response = await pb.collection('service_notification_templates').update(id, data);
    //  console.log("Update service notification template response:", response);
      return response as unknown as ServiceNotificationTemplate;
    } catch (error) {
    //  console.error(`Error updating service notification template with id ${id}:`, error);
      throw error;
    }
  },

  async deleteTemplate(id: string): Promise<boolean> {
    try {
     // console.log(`Deleting service notification template with id: ${id}`);
      await pb.collection('service_notification_templates').delete(id);
     // console.log("Service notification template deleted successfully");
      return true;
    } catch (error) {
     // console.error(`Error deleting service notification template with id ${id}:`, error);
      throw error;
    }
  }
};