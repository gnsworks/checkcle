
import { FormControl, FormField, FormItem, FormLabel, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { ServiceFormData } from "./types";
import { useQuery } from "@tanstack/react-query";
import { alertConfigService, AlertConfiguration } from "@/services/alertConfigService";
import { useState, useEffect } from "react";

interface ServiceNotificationFieldsProps {
  form: UseFormReturn<ServiceFormData>;
}

export function ServiceNotificationFields({ form }: ServiceNotificationFieldsProps) {
  const [alertConfigs, setAlertConfigs] = useState<AlertConfiguration[]>([]);
  
  // Get the current form values for debugging
  const notificationStatus = form.watch("notificationStatus");
  const notificationChannels = form.watch("notificationChannels") || [];
  const alertTemplate = form.watch("alertTemplate");
  
  console.log("Current notification values:", { 
    notificationStatus, 
    notificationChannels,
    alertTemplate 
  });
  
  // Fetch alert configurations for notification channels
  const { data: alertConfigsData } = useQuery({
    queryKey: ['alertConfigs'],
    queryFn: () => alertConfigService.getAlertConfigurations(),
  });
  
  // Update alert configs when data is loaded
  useEffect(() => {
    if (alertConfigsData) {
      // Only show enabled channels
      const enabledChannels = alertConfigsData.filter(config => config.enabled);
      setAlertConfigs(enabledChannels);
      
      // Debug log to check what alert configs are loaded
      console.log("Loaded alert configurations:", enabledChannels);
    }
  }, [alertConfigsData]);

  // Log when form values change to debug
  useEffect(() => {
    console.log("Notification values changed:", {
      notificationStatus: form.getValues("notificationStatus"),
      notificationChannels: form.getValues("notificationChannels")
    });
  }, [form.watch("notificationStatus"), form.watch("notificationChannels")]);

  const handleChannelAdd = (channelId: string) => {
    const currentChannels = form.getValues("notificationChannels") || [];
    if (!currentChannels.includes(channelId)) {
      form.setValue("notificationChannels", [...currentChannels, channelId]);
    }
  };

  const handleChannelRemove = (channelId: string) => {
    const currentChannels = form.getValues("notificationChannels") || [];
    form.setValue("notificationChannels", currentChannels.filter(id => id !== channelId));
  };

  const getSelectedChannelNames = () => {
    return (notificationChannels || []).map(channelId => {
      const config = alertConfigs.find(c => c.id === channelId);
      return config ? `${config.notify_name} (${config.notification_type})` : channelId;
    });
  };
  
  return (
    <>
      <FormField
        control={form.control}
        name="notificationStatus"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">
                Enable Notifications
              </FormLabel>
              <FormDescription>
                Enable or disable notifications for this service
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value === "enabled"}
                onCheckedChange={(checked) => {
                  field.onChange(checked ? "enabled" : "disabled");
                  // Clear notification channels when disabled
                  if (!checked) {
                    form.setValue("notificationChannels", []);
                  }
                }}
              />
            </FormControl>
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="notificationChannels"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Notification Channels</FormLabel>
            <FormDescription>
              {notificationStatus === "enabled" 
                ? "Select notification channels for this service"
                : "Enable notifications first to select channels"}
            </FormDescription>
            
            {/* Display selected channels as badges */}
            {notificationChannels && notificationChannels.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {getSelectedChannelNames().map((channelName, index) => (
                  <Badge key={notificationChannels[index]} variant="secondary" className="flex items-center gap-1">
                    {channelName}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleChannelRemove(notificationChannels[index])}
                    />
                  </Badge>
                ))}
              </div>
            )}
            
            <FormControl>
              <Select 
                onValueChange={handleChannelAdd}
                disabled={notificationStatus !== "enabled"}
                value="" // Always reset to empty after selection
              >
                <SelectTrigger className={notificationStatus !== "enabled" ? 'opacity-50' : ''}>
                  <SelectValue placeholder="Add a notification channel" />
                </SelectTrigger>
                <SelectContent>
                  {alertConfigs
                    .filter(config => !notificationChannels?.includes(config.id || ""))
                    .map((config) => (
                      <SelectItem key={config.id} value={config.id || ""}>
                        {config.notify_name} ({config.notification_type})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </FormControl>
          </FormItem>
        )}
      />
            
      <FormField
        control={form.control}
        name="alertTemplate"
        render={({ field }) => {
          // Don't convert existing values to "default"
          const displayValue = field.value || "default";
          console.log("Rendering alert template field with value:", displayValue);
          
          return (
            <FormItem>
              <FormLabel>Alert Template</FormLabel>
              <FormControl>
                <Select 
                  onValueChange={(value) => {
                    console.log("Alert template changed to:", value);
                    field.onChange(value === "default" ? "" : value);
                  }} 
                  value={displayValue}
                  disabled={notificationStatus !== "enabled"}
                >
                  <SelectTrigger className={notificationStatus !== "enabled" ? 'opacity-50' : ''}>
                    <SelectValue placeholder="Select an alert template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    {/* Add templates here when available */}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>
                {notificationStatus === "enabled"
                  ? "Choose a template for alert messages"
                  : "Enable notifications first to select template"}
              </FormDescription>
            </FormItem>
          );
        }}
      />
    </>
  );
}
