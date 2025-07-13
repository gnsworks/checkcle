
import { z } from "zod";

export const serviceSchema = z.object({
  name: z.string().min(1, "Service name is required"),
  type: z.enum(["http", "ping", "tcp", "dns"]),
  url: z.string().min(1, "URL/Domain/Host is required").refine((value) => {
    // Basic validation - more specific validation can be added per type
    return value.trim().length > 0;
  }, "Please enter a valid URL, hostname, or domain"),
  port: z.string().optional(),
  interval: z.string(),
  retries: z.string(),
  notificationStatus: z.enum(["enabled", "disabled"]).optional(),
  notificationChannels: z.array(z.string()).optional(),
  alertTemplate: z.string().optional(),
  // Regional monitoring fields - now supports multiple agents
  regionalMonitoringEnabled: z.boolean().optional(),
  regionalAgents: z.array(z.string()).optional(),
});

export type ServiceFormData = z.infer<typeof serviceSchema>;