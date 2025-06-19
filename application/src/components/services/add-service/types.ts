
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
  notificationChannel: z.string().optional(),
  alertTemplate: z.string().optional(),
});

export type ServiceFormData = z.infer<typeof serviceSchema>;