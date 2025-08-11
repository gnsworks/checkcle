import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { pb } from "@/lib/pocketbase";
import { Server } from "@/types/server.types";
import { RefreshCw, X } from "lucide-react";
import { alertConfigService, AlertConfiguration } from "@/services/alertConfigService";
import { templateService, ServerNotificationTemplate } from "@/services/templateService";
import { serverThresholdService, ServerThreshold } from "@/services/serverThresholdService";

interface EditServerDialogProps {
  server: Server | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onServerUpdated: () => void;
}

interface ServerFormData {
  name: string;
  check_interval: number;
  max_retries: number;
  docker_monitoring: boolean;
  notification_enabled: boolean;
  notification_channels: string[]; // Changed to array for multiple selections
  threshold_id: string;
  template_id: string;
}

interface ThresholdFormData {
  cpu_threshold: number;
  ram_threshold: number;
  disk_threshold: number;
  network_threshold: number;
}

export const EditServerDialog: React.FC<EditServerDialogProps> = ({
  server,
  open,
  onOpenChange,
  onServerUpdated,
}) => {
  const [formData, setFormData] = useState<ServerFormData>({
    name: "",
    check_interval: 60,
    max_retries: 3,
    docker_monitoring: false,
    notification_enabled: false,
    notification_channels: [], // Changed to array
    threshold_id: "none",
    template_id: "none",
  });
  
  const [thresholdFormData, setThresholdFormData] = useState<ThresholdFormData>({
    cpu_threshold: 80,
    ram_threshold: 80,
    disk_threshold: 80,
    network_threshold: 80,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertConfigs, setAlertConfigs] = useState<AlertConfiguration[]>([]);
  const [templates, setTemplates] = useState<ServerNotificationTemplate[]>([]);
  const [thresholds, setThresholds] = useState<ServerThreshold[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ServerNotificationTemplate | null>(null);
  const [selectedThreshold, setSelectedThreshold] = useState<ServerThreshold | null>(null);
  const [loadingAlertConfigs, setLoadingAlertConfigs] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [loadingThresholds, setLoadingThresholds] = useState(false);
  const { toast } = useToast();

  // Initialize form data when server changes
  useEffect(() => {
    if (server) {
      // Parse comma-separated notification_id into array
      const notificationChannels = server.notification_id 
        ? server.notification_id.split(',').map(id => id.trim()).filter(id => id)
        : [];
      
      setFormData({
        name: server.name || "",
        check_interval: server.check_interval || 60,
        max_retries: server.max_retries || 3,
        docker_monitoring: server.docker === "true",
        notification_enabled: server.notification_status === true,
        notification_channels: notificationChannels,
        threshold_id: server.threshold_id || "none",
        template_id: server.template_id || "none",
      });
    }
  }, [server]);

  // Load data when dialog opens
  useEffect(() => {
    if (open) {
      loadAlertConfigurations();
      loadTemplates();
      loadThresholds();
    }
  }, [open]);

  // Load existing threshold data when thresholds are loaded and we have a server with threshold_id
  useEffect(() => {
    if (server && server.threshold_id && thresholds.length > 0) {
      const existingThreshold = thresholds.find(t => t.id === server.threshold_id);
      if (existingThreshold) {
        setSelectedThreshold(existingThreshold);
        // Handle the API response format with proper field names and type conversion
        setThresholdFormData({
          cpu_threshold: parseInt(String(existingThreshold.cpu_threshold)) || 80,
          ram_threshold: parseInt(String((existingThreshold as any).ram_threshold_message || existingThreshold.ram_threshold)) || 80,
          disk_threshold: parseInt(String(existingThreshold.disk_threshold)) || 80,
          network_threshold: parseInt(String(existingThreshold.network_threshold)) || 80,
        });
      }
    }
  }, [server, thresholds]);

  // Update selected template when form data or templates change
  useEffect(() => {
    if (formData.template_id && formData.template_id !== "none" && templates.length > 0) {
      const template = templates.find(t => t.id === formData.template_id);
      setSelectedTemplate(template || null);
    } else {
      setSelectedTemplate(null);
    }
  }, [formData.template_id, templates]);

  // Update selected threshold when threshold_id changes in form
  useEffect(() => {
    if (formData.threshold_id && formData.threshold_id !== "none" && thresholds.length > 0) {
      const threshold = thresholds.find(t => t.id === formData.threshold_id);
      setSelectedThreshold(threshold || null);
      if (threshold) {
        // Handle the API response format with proper field names and type conversion
        setThresholdFormData({
          cpu_threshold: parseInt(String(threshold.cpu_threshold)) || 80,
          ram_threshold: parseInt(String((threshold as any).ram_threshold_message || threshold.ram_threshold)) || 80,
          disk_threshold: parseInt(String(threshold.disk_threshold)) || 80,
          network_threshold: parseInt(String(threshold.network_threshold)) || 80,
        });
      }
    } else if (formData.threshold_id === "none") {
      setSelectedThreshold(null);
      setThresholdFormData({
        cpu_threshold: 80,
        ram_threshold: 80,
        disk_threshold: 80,
        network_threshold: 80,
      });
    }
  }, [formData.threshold_id, thresholds]);

  const loadAlertConfigurations = async () => {
    try {
      setLoadingAlertConfigs(true);
      const configs = await alertConfigService.getAlertConfigurations();
      setAlertConfigs(configs);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load notification channels",
      });
    } finally {
      setLoadingAlertConfigs(false);
    }
  };

  const loadTemplates = async () => {
    try {
      setLoadingTemplates(true);
      const templateList = await templateService.getTemplates('server');
      // Cast to ServerNotificationTemplate[] since we know we're getting server templates
      setTemplates(templateList as ServerNotificationTemplate[]);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load templates",
      });
    } finally {
      setLoadingTemplates(false);
    }
  };

  const loadThresholds = async () => {
    try {
      setLoadingThresholds(true);
      const thresholdList = await serverThresholdService.getServerThresholds();
      setThresholds(thresholdList);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load server thresholds",
      });
    } finally {
      setLoadingThresholds(false);
    }
  };

  const handleNotificationChannelToggle = (channelId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      notification_channels: checked 
        ? [...prev.notification_channels, channelId]
        : prev.notification_channels.filter(id => id !== channelId)
    }));
  };

  const removeNotificationChannel = (channelId: string) => {
    setFormData(prev => ({
      ...prev,
      notification_channels: prev.notification_channels.filter(id => id !== channelId)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!server || isSubmitting) return;

    try {
      setIsSubmitting(true);

      // Convert notification channels array to comma-separated string
      const notificationChannelsString = formData.notification_channels.join(',');

      const updateData = {
        name: formData.name,
        check_interval: formData.check_interval,
        max_retries: formData.max_retries,
        docker: formData.docker_monitoring ? "true" : "false",
        notification_status: formData.notification_enabled,
        notification_id: notificationChannelsString,
        threshold_id: formData.threshold_id !== "none" ? formData.threshold_id : "",
        template_id: formData.template_id !== "none" ? formData.template_id : "",
        updated: new Date().toISOString(),
      };

      await pb.collection('servers').update(server.id, updateData);

      // Update threshold if a threshold is selected and values have been modified
      if (selectedThreshold && formData.threshold_id !== "none") {
        try {
          const updateThresholdData = {
            cpu_threshold: thresholdFormData.cpu_threshold,
            ram_threshold_message: thresholdFormData.ram_threshold,
            disk_threshold: thresholdFormData.disk_threshold,
            network_threshold: thresholdFormData.network_threshold,
          };

          await serverThresholdService.updateServerThreshold(selectedThreshold.id, updateThresholdData);
          
          // Update local state
          setSelectedThreshold({
            ...selectedThreshold,
            ...thresholdFormData,
          });

          // Update thresholds list
          setThresholds(prev => prev.map(t => 
            t.id === selectedThreshold.id 
              ? { ...t, ...thresholdFormData }
              : t
          ));

        } catch (error) {
          toast({
            variant: "destructive",
            title: "Warning",
            description: "Server updated but failed to update threshold values.",
          });
        }
      }

      toast({
        title: "Server updated",
        description: `${formData.name} has been updated successfully.`,
      });

      onServerUpdated();
      onOpenChange(false);
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update server. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (server) {
      const notificationChannels = server.notification_id 
        ? server.notification_id.split(',').map(id => id.trim()).filter(id => id)
        : [];
        
      setFormData({
        name: server.name || "",
        check_interval: server.check_interval || 60,
        max_retries: server.max_retries || 3,
        docker_monitoring: server.docker === "true",
        notification_enabled: server.notification_status === true,
        notification_channels: notificationChannels,
        threshold_id: server.threshold_id || "none",
        template_id: server.template_id || "none",
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Server Configuration</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="serverName">Server Name *</Label>
              <Input
                id="serverName"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter server name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="checkInterval">Check Interval</Label>
              <Select
                value={formData.check_interval.toString()}
                onValueChange={(value) => setFormData(prev => ({ ...prev, check_interval: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select interval" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 seconds</SelectItem>
                  <SelectItem value="60">1 minute</SelectItem>
                  <SelectItem value="120">2 minutes</SelectItem>
                  <SelectItem value="300">5 minutes</SelectItem>
                  <SelectItem value="600">10 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxRetries">Max Retries</Label>
              <Select
                value={formData.max_retries.toString()}
                onValueChange={(value) => setFormData(prev => ({ ...prev, max_retries: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select max retries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 retry</SelectItem>
                  <SelectItem value="2">2 retries</SelectItem>
                  <SelectItem value="3">3 retries</SelectItem>
                  <SelectItem value="5">5 retries</SelectItem>
                  <SelectItem value="10">10 retries</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dockerMonitoring">Docker Monitoring</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="dockerMonitoring"
                  checked={formData.docker_monitoring}
                  onCheckedChange={(checked) => setFormData(prev => ({ 
                    ...prev, 
                    docker_monitoring: checked
                  }))}
                />
                <Label htmlFor="dockerMonitoring" className="text-sm text-muted-foreground">
                  {formData.docker_monitoring ? "Enabled" : "Disabled"}
                </Label>
              </div>
            </div>
          </div>

          {/* Notification Status Toggle */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="notificationEnabled"
                checked={formData.notification_enabled}
                onCheckedChange={(checked) => setFormData(prev => ({ 
                  ...prev, 
                  notification_enabled: checked
                  // Remove the automatic clearing of notification_channels, threshold_id, and template_id
                }))}
              />
              <Label htmlFor="notificationEnabled">Enable Notifications</Label>
            </div>
            
            {/* Expanded Notification Settings */}
            {formData.notification_enabled && (
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <CardTitle className="text-lg">Notification Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Multiple Notification Channels Selection */}
                  <div className="space-y-2">
                    <Label>Notification Channels</Label>
                    <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-3">
                      {loadingAlertConfigs ? (
                        <div className="text-sm text-muted-foreground">Loading channels...</div>
                      ) : alertConfigs.length > 0 ? (
                        alertConfigs.map((config) => (
                          <div key={config.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`channel-${config.id}`}
                              checked={formData.notification_channels.includes(config.id || "")}
                              onCheckedChange={(checked) => 
                                handleNotificationChannelToggle(config.id || "", checked as boolean)
                              }
                            />
                            <Label 
                              htmlFor={`channel-${config.id}`} 
                              className="flex-1 text-sm cursor-pointer"
                            >
                              {config.notify_name} ({config.notification_type})
                            </Label>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-muted-foreground">No notification channels available</div>
                      )}
                    </div>
                    
                    {/* Selected Channels Display */}
                    {formData.notification_channels.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Selected Channels:</Label>
                        <div className="flex flex-wrap gap-2">
                          {formData.notification_channels.map((channelId) => {
                            const channel = alertConfigs.find(c => c.id === channelId);
                            return (
                              <div 
                                key={channelId}
                                className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm"
                              >
                                <span>{channel?.notify_name || channelId}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                                  onClick={() => removeNotificationChannel(channelId)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Server Set Threshold Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="thresholdId">Server Set Threshold</Label>
                    <Select
                      value={formData.threshold_id}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, threshold_id: value }))}
                      disabled={loadingThresholds}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={loadingThresholds ? "Loading thresholds..." : "Select server threshold"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No threshold (use default)</SelectItem>
                        {thresholds.map((threshold) => (
                          <SelectItem key={threshold.id} value={threshold.id}>
                            {threshold.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Editable Threshold Details */}
                  {selectedThreshold && (
                    <Card className="bg-muted/50">
                      <CardHeader>
                        <CardTitle className="text-base">Threshold Details: {selectedThreshold.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <Label className="text-xs font-medium text-muted-foreground">CPU Threshold (%)</Label>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={thresholdFormData.cpu_threshold}
                              onChange={(e) => setThresholdFormData(prev => ({ 
                                ...prev, 
                                cpu_threshold: parseInt(e.target.value) || 0 
                              }))}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs font-medium text-muted-foreground">RAM Threshold (%)</Label>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={thresholdFormData.ram_threshold}
                              onChange={(e) => setThresholdFormData(prev => ({ 
                                ...prev, 
                                ram_threshold: parseInt(e.target.value) || 0 
                              }))}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs font-medium text-muted-foreground">Disk Threshold (%)</Label>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={thresholdFormData.disk_threshold}
                              onChange={(e) => setThresholdFormData(prev => ({ 
                                ...prev, 
                                disk_threshold: parseInt(e.target.value) || 0 
                              }))}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs font-medium text-muted-foreground">Network Threshold (%)</Label>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={thresholdFormData.network_threshold}
                              onChange={(e) => setThresholdFormData(prev => ({ 
                                ...prev, 
                                network_threshold: parseInt(e.target.value) || 0 
                              }))}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Server Template Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="templateId">Server Template</Label>
                    <Select
                      value={formData.template_id}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, template_id: value }))}
                      disabled={loadingTemplates}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={loadingTemplates ? "Loading templates..." : "Select server template"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No template (use default)</SelectItem>
                        {templates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Template Details */}
                  {selectedTemplate && (
                    <Card className="bg-muted/50">
                      <CardHeader>
                        <CardTitle className="text-base">Template Details: {selectedTemplate.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-1 gap-3 text-sm">
                          <div>
                            <Label className="text-xs font-medium text-muted-foreground">RAM Message</Label>
                            <p className="text-sm bg-background p-2 rounded border">
                              {selectedTemplate.ram_message || "No RAM message defined"}
                            </p>
                          </div>
                          <div>
                            <Label className="text-xs font-medium text-muted-foreground">CPU Message</Label>
                            <p className="text-sm bg-background p-2 rounded border">
                              {selectedTemplate.cpu_message || "No CPU message defined"}
                            </p>
                          </div>
                          <div>
                            <Label className="text-xs font-medium text-muted-foreground">Disk Message</Label>
                            <p className="text-sm bg-background p-2 rounded border">
                              {selectedTemplate.disk_message || "No disk message defined"}
                            </p>
                          </div>
                          <div>
                            <Label className="text-xs font-medium text-muted-foreground">Network Message</Label>
                            <p className="text-sm bg-background p-2 rounded border">
                              {selectedTemplate.network_message || "No network message defined"}
                            </p>
                          </div>
                          <div>
                            <Label className="text-xs font-medium text-muted-foreground">Up Message</Label>
                            <p className="text-sm bg-background p-2 rounded border">
                              {selectedTemplate.up_message || "No up message defined"}
                            </p>
                          </div>
                          <div>
                            <Label className="text-xs font-medium text-muted-foreground">Down Message</Label>
                            <p className="text-sm bg-background p-2 rounded border">
                              {selectedTemplate.down_message || "No down message defined"}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Server"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditServerDialog;