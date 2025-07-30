
import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Server } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCurrentEndpoint } from "@/lib/pocketbase";
import { ServerAgentConfigForm } from "./ServerAgentConfigForm";
import { OneClickInstallTab } from "./OneClickInstallTab";
import { DockerOneClickTab } from "./DockerOneClickTab";
import { ManualInstallTab } from "./ManualInstallTab";

interface AddServerAgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAgentAdded: () => void;
}

export const AddServerAgentDialog: React.FC<AddServerAgentDialogProps> = ({
  open,
  onOpenChange,
  onAgentAdded,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("configure");

  // Get current PocketBase URL
  const currentPocketBaseUrl = getCurrentEndpoint();

  // Form state
  const [formData, setFormData] = useState({
    serverName: "",
    description: "",
    osType: "",
    checkInterval: "60",
    retryAttempt: "3",
    dockerEnabled: false,
    notificationEnabled: true,
  });

  // Generated server token and agent ID
  const [serverToken] = useState(() => 
    `srv_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
  );
  
  const [serverId] = useState(() => 
    `agent_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!formData.serverName || !formData.osType) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Here you would typically create the server monitoring configuration
      // For now, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast({
        title: "Server Agent Created",
        description: `${formData.serverName} monitoring agent has been configured successfully.`,
      });

      // Switch to one-click install tab after successful creation
      setActiveTab("one-click");
      onAgentAdded();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create server monitoring agent.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDialogClose = () => {
    // Reset form and tab when dialog closes
    setActiveTab("configure");
    setFormData({
      serverName: "",
      description: "",
      osType: "",
      checkInterval: "60",
      retryAttempt: "3",
      dockerEnabled: false,
      notificationEnabled: true,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[900px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Add Server Monitoring Agent
          </DialogTitle>
          <DialogDescription>
            Configure a new server monitoring agent to track system metrics and performance.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="configure">Configure Agent</TabsTrigger>
            <TabsTrigger value="one-click">One-Click Install</TabsTrigger>
            <TabsTrigger value="docker-one-click">Docker One-Click</TabsTrigger>
            <TabsTrigger value="manual">Manual Installation</TabsTrigger>
          </TabsList>

          <TabsContent value="configure" className="space-y-6">
            <ServerAgentConfigForm
              formData={formData}
              setFormData={setFormData}
              serverId={serverId}
              serverToken={serverToken}
              currentPocketBaseUrl={currentPocketBaseUrl}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
            />
          </TabsContent>

          <TabsContent value="one-click" className="space-y-6">
            <OneClickInstallTab
              serverToken={serverToken}
              currentPocketBaseUrl={currentPocketBaseUrl}
              formData={formData}
              serverId={serverId}
              onDialogClose={handleDialogClose}
            />
          </TabsContent>
          
          <TabsContent value="docker-one-click" className="space-y-6">
            <DockerOneClickTab
              serverToken={serverToken}
              currentPocketBaseUrl={currentPocketBaseUrl}
              formData={formData}
              serverId={serverId}
              onDialogClose={handleDialogClose}
            />
          </TabsContent>

          <TabsContent value="manual" className="space-y-6">
            <ManualInstallTab
              serverToken={serverToken}
              currentPocketBaseUrl={currentPocketBaseUrl}
              formData={formData}
              serverId={serverId}
              onDialogClose={handleDialogClose}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};