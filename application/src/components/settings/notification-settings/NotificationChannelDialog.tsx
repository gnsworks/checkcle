import React, { useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertConfiguration, alertConfigService } from "@/services/alertConfigService";
import { WebhookConfiguration, webhookService } from "@/services/webhookService";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";

interface NotificationChannelDialogProps {
  open: boolean;
  onClose: (refreshList: boolean) => void;
  editingConfig: AlertConfiguration | null;
}

const baseSchema = z.object({
  notify_name: z.string().min(1, "Name is required"),
  notification_type: z.enum(["telegram", "discord", "slack", "signal", "email"]),
  enabled: z.boolean().default(true),
  service_id: z.string().default("global"),
  template_id: z.string().optional(),
});

const telegramSchema = baseSchema.extend({
  notification_type: z.literal("telegram"),
  telegram_chat_id: z.string().min(1, "Chat ID is required"),
  bot_token: z.string().min(1, "Bot token is required"),
});

const discordSchema = baseSchema.extend({
  notification_type: z.literal("discord"),
  discord_webhook_url: z.string().url("Must be a valid URL"),
});

const slackSchema = baseSchema.extend({
  notification_type: z.literal("slack"),
  slack_webhook_url: z.string().url("Must be a valid URL"),
});

const signalSchema = baseSchema.extend({
  notification_type: z.literal("signal"),
  signal_number: z.string().min(1, "Signal number is required"),
});

const emailSchema = baseSchema.extend({
  notification_type: z.literal("email"),
  email_address: z.string().email("Valid email is required"),
  email_sender_name: z.string().min(1, "Sender name is required"),
  smtp_server: z.string().min(1, "SMTP server is required"),
  smtp_port: z.string().min(1, "SMTP port is required"),
});

const webhookSchema = baseSchema.extend({
  notification_type: z.literal("webhook"),
  webhook_url: z.string().url("Must be a valid URL"),
  webhook_method: z.enum(["GET", "POST", "PUT", "PATCH"]).default("POST"),
  webhook_secret: z.string().optional(),
  webhook_headers: z.string().optional(),
  webhook_description: z.string().optional(),
});

const formSchema = z.discriminatedUnion("notification_type", [
  telegramSchema,
  discordSchema,
  slackSchema,
  signalSchema,
  emailSchema,
  webhookSchema
]);

type FormValues = z.infer<typeof formSchema>;

const notificationTypeOptions = [
  { value: "telegram", label: "Telegram", description: "Send notifications via Telegram bot" },
  { value: "discord", label: "Discord", description: "Send notifications to Discord webhook" },
  { value: "slack", label: "Slack", description: "Send notifications to Slack webhook" },
  { value: "signal", label: "Signal", description: "Send notifications via Signal" },
  { value: "email", label: "Email", description: "Send notifications via email" },
  { value: "webhook", label: "Webhook", description: "Send notifications to custom webhook" },
];

export const NotificationChannelDialog = ({ 
  open, 
  onClose,
  editingConfig 
}: NotificationChannelDialogProps) => {
  const isEditing = !!editingConfig;
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      notify_name: "",
      notification_type: "telegram" as const,
      enabled: true,
      service_id: "global",
      template_id: "",
    },
  });

  const { watch, reset } = form;
  const notificationType = watch("notification_type");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  useEffect(() => {
    if (editingConfig) {
      // Handle string vs boolean for enabled field
      const enabled = typeof editingConfig.enabled === 'string' 
        ? editingConfig.enabled === "true" 
        : !!editingConfig.enabled;

      reset({
        ...editingConfig,
        enabled
      });
    } else if (open) {
      reset({
        notify_name: "",
        notification_type: "telegram" as const,
        enabled: true,
        service_id: "global",
        template_id: "",
      });
    }
  }, [editingConfig, open, reset]);

  const handleClose = () => {
    onClose(false);
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      if (values.notification_type === "webhook") {
        // Handle webhook creation/update separately
        const webhookData: Omit<WebhookConfiguration, 'id' | 'collectionId' | 'collectionName' | 'created' | 'updated'> = {
          name: values.notify_name,
          url: values.webhook_url,
          enabled: values.enabled ? "on" : "off",
          method: values.webhook_method || "POST",
          secret: values.webhook_secret || "",
          headers: values.webhook_headers || "",
          description: values.webhook_description || "",
          user_id: "global", // or get current user id
        };

        if (isEditing && editingConfig?.id) {
          await webhookService.updateWebhook(editingConfig.id, webhookData);
        } else {
          await webhookService.createWebhook(webhookData);
        }
      } else {
        // Handle other notification types with existing service
        const configData = {
          ...values,
          service_id: values.service_id || "global",
        };
        
        if (isEditing && editingConfig?.id) {
          await alertConfigService.updateAlertConfiguration(editingConfig.id, configData);
        } else {
          await alertConfigService.createAlertConfiguration(configData as any);
        }
      }
      onClose(true); // Close with refresh
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => handleClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Notification Channel" : "Add Notification Channel"}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="notify_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Channel Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Notification Channel" {...field} />
                  </FormControl>
                  <FormDescription>
                    A name to identify this notification channel
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notification_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Channel Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select notification type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {notificationTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex flex-col">
                            <span className="font-medium">{option.label}</span>
                            <span className="text-xs text-muted-foreground">{option.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Show different fields based on notification type */}
            {notificationType === "telegram" && (
              <>
                <FormField
                  control={form.control}
                  name="telegram_chat_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chat ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Telegram Chat ID" {...field} />
                      </FormControl>
                      <FormDescription>
                        The Telegram chat ID to send notifications to
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bot_token"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bot Token</FormLabel>
                      <FormControl>
                        <Input placeholder="Telegram Bot Token" {...field} type="password" />
                      </FormControl>
                      <FormDescription>
                        Your Telegram bot token from @BotFather
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            
            {notificationType === "discord" && (
              <FormField
                control={form.control}
                name="discord_webhook_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Webhook URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://discord.com/api/webhooks/..." {...field} />
                    </FormControl>
                    <FormDescription>
                      Discord webhook URL from your server settings
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            {notificationType === "slack" && (
              <FormField
                control={form.control}
                name="slack_webhook_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Webhook URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://hooks.slack.com/services/..." {...field} />
                    </FormControl>
                    <FormDescription>
                      Slack incoming webhook URL
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            {notificationType === "signal" && (
              <FormField
                control={form.control}
                name="signal_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Signal Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+1234567890" {...field} />
                    </FormControl>
                    <FormDescription>
                      Signal phone number to send notifications to
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {notificationType === "email" && (
              <>
                <FormField
                  control={form.control}
                  name="email_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="notifications@example.com" {...field} type="email" />
                      </FormControl>
                      <FormDescription>
                        Email address to send notifications to
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email_sender_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sender Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Alert System" {...field} />
                      </FormControl>
                      <FormDescription>
                        Display name for outgoing emails
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="smtp_server"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SMTP Server</FormLabel>
                        <FormControl>
                          <Input placeholder="smtp.gmail.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="smtp_port"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SMTP Port</FormLabel>
                        <FormControl>
                          <Input placeholder="587" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}

            {notificationType === "webhook" && (
              <>
                <FormField
                  control={form.control}
                  name="webhook_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Webhook URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://api.example.com/webhook" {...field} />
                      </FormControl>
                      <FormDescription>
                        The URL where webhook notifications will be sent
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="webhook_method"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>HTTP Method</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select method" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="POST">POST</SelectItem>
                            <SelectItem value="PUT">PUT</SelectItem>
                            <SelectItem value="PATCH">PATCH</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="webhook_secret"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Secret (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="webhook_secret_key" {...field} type="password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="webhook_headers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom Headers (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder='{"Authorization": "Bearer token"}' {...field} />
                      </FormControl>
                      <FormDescription>
                        JSON format for additional headers
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="webhook_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Description of this webhook" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            
            <FormField
              control={form.control}
              name="enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Enabled</FormLabel>
                    <FormDescription>
                      Enable or disable this notification channel
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button variant="outline" type="button" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Update Channel" : "Create Channel"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};