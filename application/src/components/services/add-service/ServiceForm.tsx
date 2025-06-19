
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { serviceSchema, ServiceFormData } from "./types";
import { ServiceBasicFields } from "./ServiceBasicFields";
import { ServiceTypeField } from "./ServiceTypeField";
import { ServiceConfigFields } from "./ServiceConfigFields";
import { ServiceNotificationFields } from "./ServiceNotificationFields";
import { ServiceFormActions } from "./ServiceFormActions";
import { serviceService } from "@/services/serviceService";
import { Service } from "@/types/service.types";

interface ServiceFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: Service | null;
  isEdit?: boolean;
  onSubmitStart?: () => void;
}

export function ServiceForm({ 
  onSuccess, 
  onCancel, 
  initialData, 
  isEdit = false,
  onSubmitStart
}: ServiceFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with default values
  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: "",
      type: "http",
      url: "",
      port: "",
      interval: "60",
      retries: "3",
      notificationChannel: "",
      alertTemplate: "",
    },
    mode: "onBlur",
  });

  // Populate form when initialData changes (separate from initialization)
  useEffect(() => {
    if (initialData && isEdit) {
      // Ensure the type is one of the allowed values
      const serviceType = (initialData.type || "http").toLowerCase();
      const validType = ["http", "ping", "tcp", "dns"].includes(serviceType) 
        ? serviceType as "http" | "ping" | "tcp" | "dns"
        : "http";

      // For PING services, use host field; for DNS use domain field; for TCP use host field; others use url
      let urlValue = "";
      let portValue = "";
      
      if (validType === "ping") {
        urlValue = initialData.host || "";
      } else if (validType === "dns") {
        urlValue = initialData.domain || "";
      } else if (validType === "tcp") {
        urlValue = initialData.host || "";
        portValue = String(initialData.port || "");
      } else {
        urlValue = initialData.url || "";
      }

      // Reset the form with initial data values
      form.reset({
        name: initialData.name || "",
        type: validType,
        url: urlValue,
        port: portValue,
        interval: String(initialData.interval || 60),
        retries: String(initialData.retries || 3),
        notificationChannel: initialData.notificationChannel || "",
        alertTemplate: initialData.alertTemplate || "",
      });

      // Log for debugging
      console.log("Populating form with data:", { type: validType, url: urlValue, port: portValue });
    }
  }, [initialData, isEdit, form]);

  const handleSubmit = async (data: ServiceFormData) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    if (onSubmitStart) onSubmitStart();
    
    try {
      console.log("Form data being submitted:", data); // Debug log for submitted data
      
      // Prepare service data with proper field mapping
      const serviceData = {
        name: data.name,
        type: data.type,
        interval: parseInt(data.interval),
        retries: parseInt(data.retries),
        notificationChannel: data.notificationChannel || undefined,
        alertTemplate: data.alertTemplate || undefined,
        // Map the URL field to appropriate database field based on service type
        ...(data.type === "dns" 
          ? { domain: data.url, url: "", host: "", port: undefined }  // DNS: store in domain field
          : data.type === "ping"
          ? { host: data.url, url: "", domain: "", port: undefined }  // PING: store in host field  
          : data.type === "tcp"
          ? { host: data.url, port: parseInt(data.port || "80"), url: "", domain: "" }  // TCP: store in host and port fields
          : { url: data.url, domain: "", host: "", port: undefined }  // HTTP: store in url field
        )
      };
      
      if (isEdit && initialData) {
        // Update existing service
        await serviceService.updateService(initialData.id, serviceData);
        
        toast({
          title: "Service updated",
          description: `${data.name} has been updated successfully.`,
        });
      } else {
        // Create new service
        await serviceService.createService(serviceData);
        
        toast({
          title: "Service created",
          description: `${data.name} has been added to monitoring.`,
        });
      }
      
      onSuccess();
      if (!isEdit) {
        form.reset();
      }
    } catch (error) {
      console.error(`Error ${isEdit ? 'updating' : 'creating'} service:`, error);
      toast({
        title: `Failed to ${isEdit ? 'update' : 'create'} service`,
        description: `An error occurred while ${isEdit ? 'updating' : 'creating'} the service.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 pb-4">
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground border-b pb-2">Basic Information</h3>
            <ServiceBasicFields form={form} />
            <ServiceTypeField form={form} />
          </div>
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground border-b pb-2">Configuration</h3>
            <ServiceConfigFields form={form} />
          </div>
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground border-b pb-2">Notifications</h3>
            <ServiceNotificationFields form={form} />
          </div>
        </div>
        
        <ServiceFormActions 
          isSubmitting={isSubmitting} 
          onCancel={onCancel} 
          submitLabel={isEdit ? "Update Service" : "Create Service"}
        />
      </form>
    </Form>
  );
}