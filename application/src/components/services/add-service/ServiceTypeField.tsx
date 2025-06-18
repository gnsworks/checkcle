
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, Wifi, Server, Globe2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { ServiceFormData } from "./types";

interface ServiceTypeFieldProps {
  form: UseFormReturn<ServiceFormData>;
}

export function ServiceTypeField({ form }: ServiceTypeFieldProps) {
  const getServiceIcon = (type: string) => {
    switch (type) {
      case "http":
        return <Globe className="w-4 h-4" />;
      case "ping":
        return <Wifi className="w-4 h-4" />;
      case "tcp":
        return <Server className="w-4 h-4" />;
      case "dns":
        return <Globe2 className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  return (
    <FormField
      control={form.control}
      name="type"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Service Type</FormLabel>
          <FormControl>
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value}
            >
              <SelectTrigger>
                <SelectValue>
                  {field.value && (
                    <div className="flex items-center gap-2">
                      {getServiceIcon(field.value)}
                      <span>{field.value.toUpperCase()}</span>
                    </div>
                  )}
                  {!field.value && "Select a service type"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="http">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      <span>HTTP/S</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Monitor websites and REST APIs with HTTP/HTTPS Protocol 
                    </p>
                  </div>
                </SelectItem>
                <SelectItem value="ping">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <Wifi className="w-4 h-4" />
                      <span>PING</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Monitor host availability with PING Protocol
                    </p>
                  </div>
                </SelectItem>
                <SelectItem value="tcp">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <Server className="w-4 h-4" />
                      <span>TCP</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Monitor TCP port connectivity with TCP Protocol
                    </p>
                  </div>
                </SelectItem>
                <SelectItem value="dns">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <Globe2 className="w-4 h-4" />
                      <span>DNS</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Monitor DNS resolution
                    </p>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </FormControl>
        </FormItem>
      )}
    />
  );
}