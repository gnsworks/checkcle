
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { templateService, TemplateType, AnyTemplateData } from "@/services/templateService";
import { useEffect } from "react";

// Base schema
const baseSchema = {
  name: z.string().min(2, "Name is required and must be at least 2 characters"),
  templateType: z.enum(['server', 'service', 'ssl'] as const),
  placeholder: z.string().optional(),
};

// Server template schema
const serverTemplateSchema = z.object({
  ...baseSchema,
  templateType: z.literal('server'),
  ram_message: z.string().min(1, "RAM message is required"),
  cpu_message: z.string().min(1, "CPU message is required"),
  disk_message: z.string().min(1, "Disk message is required"),
  network_message: z.string().min(1, "Network message is required"),
  up_message: z.string().min(1, "Up message is required"),
  down_message: z.string().min(1, "Down message is required"),
  notification_id: z.string().optional(),
  warning_message: z.string().min(1, "Warning message is required"),
  paused_message: z.string().min(1, "Paused message is required"),
  cpu_temp_message: z.string().min(1, "CPU temperature message is required"),
  disk_io_message: z.string().min(1, "Disk I/O message is required"),
});

// Service template schema
const serviceTemplateSchema = z.object({
  ...baseSchema,
  templateType: z.literal('service'),
  up_message: z.string().min(1, "Up message is required"),
  down_message: z.string().min(1, "Down message is required"),
  maintenance_message: z.string().min(1, "Maintenance message is required"),
  incident_message: z.string().min(1, "Incident message is required"),
  resolved_message: z.string().min(1, "Resolved message is required"),
  warning_message: z.string().min(1, "Warning message is required"),
});

// SSL template schema
const sslTemplateSchema = z.object({
  ...baseSchema,
  templateType: z.literal('ssl'),
  expired: z.string().min(1, "Expired message is required"),
  exiring_soon: z.string().min(1, "Expiring soon message is required"),
  warning: z.string().min(1, "Warning message is required"),
});

// Combined schema
export const templateFormSchema = z.discriminatedUnion("templateType", [
  serverTemplateSchema,
  serviceTemplateSchema,
  sslTemplateSchema,
]);

export type TemplateFormData = z.infer<typeof templateFormSchema>;

// Default form values for each template type
const getDefaultValues = (templateType: TemplateType): TemplateFormData => {
  const base = {
    name: "",
    templateType,
    placeholder: "",
  };

  switch (templateType) {
    case 'server':
      return {
        ...base,
        templateType: 'server' as const,
        ram_message: "Memory usage on ${server_name} is ${ram_usage}% (threshold: ${threshold}%)",
        cpu_message: "CPU usage on ${server_name} is ${cpu_usage}% (threshold: ${threshold}%)",
        disk_message: "Disk usage on ${server_name} is ${disk_usage}% (threshold: ${threshold}%)",
        network_message: "Network usage on ${server_name} is ${network_usage}% (threshold: ${threshold}%)",
        up_message: "Server ${server_name} is UP and responding",
        down_message: "Server ${server_name} is DOWN",
        notification_id: "",
        warning_message: "Warning: Server ${server_name} requires attention",
        paused_message: "Monitoring for server ${server_name} is paused",
        cpu_temp_message: "CPU temperature on ${server_name} is ${cpu_temp}°C",
        disk_io_message: "Disk I/O on ${server_name} is ${disk_io} MB/s",
      };
    
    case 'service':
      return {
        ...base,
        templateType: 'service' as const,
        up_message: "Service ${service_name} is UP. Response time: ${response_time}ms",
        down_message: "Service ${service_name} is DOWN. Status: ${status}",
        maintenance_message: "Service ${service_name} is under maintenance",
        incident_message: "Service ${service_name} has an incident",
        resolved_message: "Issue with service ${service_name} has been resolved",
        warning_message: "Warning: Service ${service_name} response time is high",
      };
    
    case 'ssl':
      return {
        ...base,
        templateType: 'ssl' as const,
        expired: "SSL certificate for ${domain} has EXPIRED on ${expiry_date}",
        exiring_soon: "SSL certificate for ${domain} will expire in ${days_left} days on ${expiry_date}",
        warning: "Warning: SSL certificate for ${domain} requires attention",
      };
    
    default:
      throw new Error(`Unknown template type: ${templateType}`);
  }
};

export interface UseTemplateFormProps {
  templateId: string | null;
  templateType: TemplateType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const useTemplateForm = ({ templateId, templateType, open, onOpenChange, onSuccess }: UseTemplateFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditMode = !!templateId;

 // console.log("Template form initialized with templateId:", templateId, "templateType:", templateType, "isEditMode:", isEditMode);

  const form = useForm<TemplateFormData>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: getDefaultValues(templateType),
    mode: "onChange"
  });

  // Query to fetch template data for editing
  const { isLoading: isLoadingTemplate, data: templateData } = useQuery({
    queryKey: ['template', templateId, templateType],
    queryFn: () => {
      if (!templateId) return null;
    //  console.log("Fetching template data for ID:", templateId, "type:", templateType);
      return templateService.getTemplate(templateId, templateType);
    },
    enabled: !!templateId && open,
  });

  // Set form values when template data is loaded
  useEffect(() => {
    if (templateData && open) {
    //  console.log("Setting form values with template data:", templateData);
      
      const formData: any = {
        name: templateData.name || "",
        templateType: templateType,
        placeholder: (templateData as any).placeholder || "",
      };

      // Add template-specific fields
      Object.keys(templateData).forEach(key => {
        if (!['id', 'collectionId', 'collectionName', 'created', 'updated', 'name'].includes(key)) {
          formData[key] = (templateData as any)[key] || "";
        }
      });

      form.reset(formData);
    }
  }, [templateData, open, form, templateType]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: AnyTemplateData) => templateService.createTemplate(data, templateType),
    onSuccess: () => {
      toast({
        title: "Template created",
        description: "Your notification template has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['notification_templates', templateType] });
      onSuccess();
    },
    onError: (error) => {
    //  console.error("Error creating template:", error);
      toast({
        title: "Error",
        description: "Failed to create template. Please check your inputs and try again.",
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: AnyTemplateData }) => 
      templateService.updateTemplate(id, data, templateType),
    onSuccess: () => {
      toast({
        title: "Template updated",
        description: "Your notification template has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['notification_templates', templateType] });
      onSuccess();
    },
    onError: (error) => {
    //  console.error("Error updating template:", error);
      toast({
        title: "Error",
        description: "Failed to update template. Please check your inputs and try again.",
        variant: "destructive",
      });
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // Handle form submission
  const onSubmit = (formData: TemplateFormData) => {
   // console.log("Submitting form data:", formData);
    
    // Remove templateType from the data before sending to API
    const { templateType: _, ...templateDataWithoutType } = formData;
    const completeData = templateDataWithoutType as AnyTemplateData;
    
    if (isEditMode && templateId) {
    //  console.log("Updating template with ID:", templateId);
      updateMutation.mutate({ id: templateId, data: completeData });
    } else {
    //  console.log("Creating new template");
      createMutation.mutate(completeData);
    }
  };

  // Reset form when dialog closes or template type changes
  useEffect(() => {
    if (!open) {
    //  console.log("Dialog closed, resetting form");
      form.reset(getDefaultValues(templateType));
    }
  }, [open, form, templateType]);

  return {
    form,
    isEditMode,
    isLoadingTemplate,
    isSubmitting,
    onSubmit
  };
};