
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { ServiceFormData } from "./types";

interface ServiceUrlFieldProps {
  form: UseFormReturn<ServiceFormData>;
}

export function ServiceUrlField({ form }: ServiceUrlFieldProps) {
  const serviceType = form.watch("type");
  
  const getPlaceholder = () => {
    switch (serviceType) {
      case "http":
        return "https://example.com";
      case "ping":
        return "example.com or 192.168.1.1";
      case "tcp":
        return "example.com or 192.168.1.1";
      case "dns":
        return "example.com";
      default:
        return "Enter URL or hostname";
    }
  };

  const getDescription = () => {
    switch (serviceType) {
      case "http":
        return "Enter the full URL including protocol (http:// or https://)";
      case "ping":
        return "Enter hostname or IP address to ping";
      case "tcp":
        return "Enter hostname or IP address for TCP connection test";
      case "dns":
        return "Enter domain name for DNS record monitoring (A, AAAA, MX, etc.)";
      default:
        return "Enter the target URL or hostname for monitoring";
    }
  };

  const getFieldLabel = () => {
    switch (serviceType) {
      case "dns":
        return "Domain Name";
      case "ping":
        return "Hostname/IP";
      case "tcp":
        return "Hostname/IP";
      default:
        return "Target URL/Host";
    }
  };

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="url"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{getFieldLabel()}</FormLabel>
            <FormControl>
              <Input 
                placeholder={getPlaceholder()}
                {...field}
                onChange={(e) => {
                //  console.log(`${serviceType === "dns" ? "Domain" : serviceType === "tcp" ? "Host" : "URL"} field changed:`, e.target.value);
                  field.onChange(e);
                }}
              />
            </FormControl>
            <FormDescription className="text-xs">
              {getDescription()}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {serviceType === "tcp" && (
        <FormField
          control={form.control}
          name="port"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Port</FormLabel>
              <FormControl>
                <Input 
                  placeholder="8080"
                  type="number"
                  {...field}
                  onChange={(e) => {
                   // console.log("Port field changed:", e.target.value);
                    field.onChange(e);
                  }}
                />
              </FormControl>
              <FormDescription className="text-xs">
                Enter the port number for TCP connection test
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
}