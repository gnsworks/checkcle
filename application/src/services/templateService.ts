

import { pb } from "@/lib/pocketbase";

export interface NotificationTemplate {
  id: string;
  collectionId: string;
  collectionName: string;
  name: string;
  up_message: string;
  down_message: string;
  service_name_placeholder: string;
  response_time_placeholder: string;
  status_placeholder: string;
  threshold_placeholder: string;
  type: string;
  maintenance_message: string;
  incident_message: string;
  resolved_message: string;
  created: string;
  updated: string;
}

export interface CreateUpdateTemplateData {
  name: string;
  up_message: string;
  down_message: string;
  service_name_placeholder: string;
  response_time_placeholder: string;
  status_placeholder: string;
  threshold_placeholder: string;
  type: string;
  maintenance_message: string;
  incident_message: string;
  resolved_message: string;
}

export const templateService = {
  async getTemplates(): Promise<NotificationTemplate[]> {
    try {
    //  console.log("Fetching server notification templates");
      const response = await pb.collection('server_notification_templates').getList(1, 50, {
        sort: '-created',
      });
     // console.log("Server templates response:", response);
      return response.items as unknown as NotificationTemplate[];
    } catch (error) {
     // console.error("Error fetching server templates:", error);
      throw error;
    }
  },

  async getTemplate(id: string): Promise<NotificationTemplate> {
    try {
     // console.log(`Fetching server template with id: ${id}`);
      const response = await pb.collection('server_notification_templates').getOne(id);
     // console.log("Server template response:", response);
      return response as unknown as NotificationTemplate;
    } catch (error) {
     // console.error(`Error fetching server template with id ${id}:`, error);
      throw error;
    }
  },

  async createTemplate(data: CreateUpdateTemplateData): Promise<NotificationTemplate> {
    try {
     // console.log("Creating new server template with data:", data);
      const response = await pb.collection('server_notification_templates').create(data);
     // console.log("Create server template response:", response);
      return response as unknown as NotificationTemplate;
    } catch (error) {
    //  console.error("Error creating server template:", error);
      throw error;
    }
  },

  async updateTemplate(id: string, data: Partial<CreateUpdateTemplateData>): Promise<NotificationTemplate> {
    try {
     // console.log(`Updating server template with id: ${id}`, data);
      const response = await pb.collection('server_notification_templates').update(id, data);
    //  console.log("Update server template response:", response);
      return response as unknown as NotificationTemplate;
    } catch (error) {
    //  console.error(`Error updating server template with id ${id}:`, error);
      throw error;
    }
  },

  async deleteTemplate(id: string): Promise<boolean> {
    try {
     // console.log(`Deleting server template with id: ${id}`);
      await pb.collection('server_notification_templates').delete(id);
    //  console.log("Server template deleted successfully");
      return true;
    } catch (error) {
    //  console.error(`Error deleting server template with id ${id}:`, error);
      throw error;
    }
  }
};
