
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { templateService, TemplateType } from "@/services/templateService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, RefreshCcw } from "lucide-react";
import { TemplateList } from "./TemplateList";
import { TemplateDialog } from "./TemplateDialog";
import { useToast } from "@/hooks/use-toast";

export const AlertsTemplates = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TemplateType>('service');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [editingTemplateType, setEditingTemplateType] = useState<TemplateType | null>(null);

  const {
    data: templates = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['notification_templates', activeTab],
    queryFn: () => templateService.getTemplates(activeTab),
  });

  const handleAddTemplate = (templateType: TemplateType) => {
    setEditingTemplate(null);
    setEditingTemplateType(templateType);
    setIsDialogOpen(true);
  };

  const handleEditTemplate = (id: string, templateType: TemplateType) => {
    setEditingTemplate(id);
    setEditingTemplateType(templateType);
    setIsDialogOpen(true);
  };

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshing",
      description: "Updating template list...",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Alert Templates</CardTitle>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => handleAddTemplate(activeTab)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Template
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TemplateType)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="service">Service Uptime</TabsTrigger>
            <TabsTrigger value="server">Server Monitoring</TabsTrigger>
            <TabsTrigger value="ssl">SSL Certificate</TabsTrigger>
            <TabsTrigger value="server_threshold">Server Threshold</TabsTrigger>
          </TabsList>
          
          <TabsContent value="service" className="mt-4">
            {error ? (
              <div className="text-center p-6">
                <p className="text-destructive mb-4">Error loading service templates</p>
                <Button variant="outline" onClick={() => refetch()}>
                  Try Again
                </Button>
              </div>
            ) : (
              <TemplateList 
                templates={templates} 
                isLoading={isLoading} 
                onEdit={(id) => handleEditTemplate(id, 'service')}
                refetchTemplates={refetch}
                templateType="service"
              />
            )}
          </TabsContent>
          
          <TabsContent value="server" className="mt-4">
            {error ? (
              <div className="text-center p-6">
                <p className="text-destructive mb-4">Error loading server templates</p>
                <Button variant="outline" onClick={() => refetch()}>
                  Try Again
                </Button>
              </div>
            ) : (
              <TemplateList 
                templates={templates} 
                isLoading={isLoading} 
                onEdit={(id) => handleEditTemplate(id, 'server')}
                refetchTemplates={refetch}
                templateType="server"
              />
            )}
          </TabsContent>
          
          <TabsContent value="ssl" className="mt-4">
            {error ? (
              <div className="text-center p-6">
                <p className="text-destructive mb-4">Error loading SSL templates</p>
                <Button variant="outline" onClick={() => refetch()}>
                  Try Again
                </Button>
              </div>
            ) : (
              <TemplateList 
                templates={templates} 
                isLoading={isLoading} 
                onEdit={(id) => handleEditTemplate(id, 'ssl')}
                refetchTemplates={refetch}
                templateType="ssl"
              />
            )}
          </TabsContent>
          
          <TabsContent value="server_threshold" className="mt-4">
            {error ? (
              <div className="text-center p-6">
                <p className="text-destructive mb-4">Error loading server threshold templates</p>
                <Button variant="outline" onClick={() => refetch()}>
                  Try Again
                </Button>
              </div>
            ) : (
              <TemplateList 
                templates={templates} 
                isLoading={isLoading} 
                onEdit={(id) => handleEditTemplate(id, 'server_threshold')}
                refetchTemplates={refetch}
                templateType="server_threshold"
              />
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      <TemplateDialog
        open={isDialogOpen}
        templateId={editingTemplate}
        templateType={editingTemplateType}
        onOpenChange={setIsDialogOpen}
        onSuccess={() => {
          refetch();
          setIsDialogOpen(false);
        }}
      />
    </Card>
  );
};