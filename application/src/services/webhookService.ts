
import { pb } from "@/lib/pocketbase";
import { toast } from "@/hooks/use-toast";

export interface WebhookConfiguration {
  id?: string;
  collectionId?: string;
  collectionName?: string;
  user_id?: string;
  url: string;
  enabled: string;
  secret?: string;
  headers?: string;
  retry_count?: string;
  trigger_events?: string;
  description?: string;
  name: string;
  method?: string;
  payload_template?: string;
  created?: string;
  updated?: string;
}

export const webhookService = {
  async createWebhook(config: Omit<WebhookConfiguration, 'id' | 'collectionId' | 'collectionName' | 'created' | 'updated'>): Promise<WebhookConfiguration | null> {
   // console.info("Creating webhook configuration:", config);
    try {
      const result = await pb.collection('webhook').create(config);
     // console.info("Webhook configuration created:", result);
      toast({
        title: "Success",
        description: "Webhook created successfully",
      });
      return result as WebhookConfiguration;
    } catch (error) {
     // console.error("Error creating webhook configuration:", error);
      toast({
        title: "Error",
        description: "Failed to create webhook",
        variant: "destructive"
      });
      return null;
    }
  },

  async updateWebhook(id: string, config: Partial<WebhookConfiguration>): Promise<WebhookConfiguration | null> {
   // console.info(`Updating webhook configuration ${id}:`, config);
    try {
      const result = await pb.collection('webhook').update(id, config);
    //  console.info("Webhook configuration updated:", result);
      toast({
        title: "Success",
        description: "Webhook updated successfully",
      });
      return result as WebhookConfiguration;
    } catch (error) {
     // console.error("Error updating webhook configuration:", error);
      toast({
        title: "Error",
        description: "Failed to update webhook",
        variant: "destructive"
      });
      return null;
    }
  }
};