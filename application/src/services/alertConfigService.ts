
import { pb } from "@/lib/pocketbase";
import { toast } from "@/hooks/use-toast";

export interface AlertConfiguration {
  id?: string;
  collectionId?: string;
  collectionName?: string;
  service_id: string;
  notification_type: "telegram" | "discord" | "slack" | "signal" | "google_chat" | "email" | "webhook";
  telegram_chat_id?: string;
  discord_webhook_url?: string;
  signal_number?: string;
  notify_name: string;
  bot_token?: string;
  template_id?: string;
  slack_webhook_url?: string;
  google_chat_webhook_url?: string;
  enabled: boolean;
  created?: string;
  updated?: string;
  // Email specific fields
  email_address?: string;
  email_sender_name?: string;
  smtp_server?: string;
  smtp_port?: string;
  smtp_password?: string;
  webhook_id?: string;
  channel_id?: string;
}

export const alertConfigService = {
  async getAlertConfigurations(): Promise<AlertConfiguration[]> {
    try {
      const response = await pb.collection('alert_configurations').getList(1, 50);
      return response.items as AlertConfiguration[];
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load notification settings",
        variant: "destructive"
      });
      return [];
    }
  },

  async createAlertConfiguration(config: Omit<AlertConfiguration, 'id' | 'collectionId' | 'collectionName' | 'created' | 'updated'>): Promise<AlertConfiguration | null> {
  
    try {
      // Build the configuration object with proper field mapping
      const cleanConfig: any = {
        service_id: config.service_id || "global",
        notification_type: config.notification_type,
        notify_name: config.notify_name,
        enabled: config.enabled,
        template_id: config.template_id || "",
      };
     
      // Add type-specific fields based on notification type
      if (config.notification_type === "telegram") {
        cleanConfig.telegram_chat_id = config.telegram_chat_id || "";
        cleanConfig.bot_token = config.bot_token || "";
      } else if (config.notification_type === "discord") {
        cleanConfig.discord_webhook_url = config.discord_webhook_url || "";
      } else if (config.notification_type === "slack") {
        cleanConfig.slack_webhook_url = config.slack_webhook_url || "";
      } else if (config.notification_type === "signal") {
        cleanConfig.signal_number = config.signal_number || "";
      } else if (config.notification_type === "google_chat") {
        cleanConfig.google_chat_webhook_url = config.google_chat_webhook_url || "";
      } else if (config.notification_type === "email") {      
        cleanConfig.email_address = config.email_address || "";
        cleanConfig.email_sender_name = config.email_sender_name || "";
        cleanConfig.smtp_server = config.smtp_server || "";
        cleanConfig.smtp_port = config.smtp_port || "";
        cleanConfig.smtp_password = config.smtp_password || "";

      }
      const result = await pb.collection('alert_configurations').create(cleanConfig);
         
      toast({
        title: "Success",
        description: "Notification channel created successfully",
      });
      return result as AlertConfiguration;
    } catch (error) {    
      // Try to get more details from the error
      if (error && typeof error === 'object') {
      }
      
      toast({
        title: "Error",
        description: "Failed to create notification channel",
        variant: "destructive"
      });
      return null;
    }
  },

  async updateAlertConfiguration(id: string, config: Partial<AlertConfiguration>): Promise<AlertConfiguration | null> {
    try {
      const result = await pb.collection('alert_configurations').update(id, config);
      toast({
        title: "Success",
        description: "Notification channel updated successfully",
      });
      return result as AlertConfiguration;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update notification channel",
        variant: "destructive"
      });
      return null;
    }
  },

  async deleteAlertConfiguration(id: string): Promise<boolean> {
    try {
      await pb.collection('alert_configurations').delete(id);
      toast({
        title: "Success",
        description: "Notification channel removed",
      });
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove notification channel",
        variant: "destructive"
      });
      return false;
    }
  }
};