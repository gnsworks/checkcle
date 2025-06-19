
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { ServiceFormData } from "./types";
import { ServiceUrlField } from "./ServiceUrlField";
import { useState } from "react";

interface ServiceConfigFieldsProps {
  form: UseFormReturn<ServiceFormData>;
}

export function ServiceConfigFields({ form }: ServiceConfigFieldsProps) {
  const [isCustomInterval, setIsCustomInterval] = useState(false);
  const intervalValue = form.watch("interval");

  const handleIntervalChange = (value: string) => {
    if (value === "custom") {
      setIsCustomInterval(true);
      form.setValue("interval", "");
    } else {
      setIsCustomInterval(false);
      form.setValue("interval", value);
    }
  };

  return (
    <div className="space-y-4">
      <ServiceUrlField form={form} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="interval"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Check Interval</FormLabel>
              {!isCustomInterval ? (
                <FormControl>
                  <Select onValueChange={handleIntervalChange} value={isCustomInterval ? "custom" : field.value}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 seconds</SelectItem>
                      <SelectItem value="60">1 minute</SelectItem>
                      <SelectItem value="300">5 minutes</SelectItem>
                      <SelectItem value="900">15 minutes</SelectItem>
                      <SelectItem value="1800">30 minutes</SelectItem>
                      <SelectItem value="3600">1 hour</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
              ) : (
                <div className="space-y-2">
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter interval in seconds"
                      value={field.value}
                      onChange={field.onChange}
                      min="10"
                    />
                  </FormControl>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomInterval(false);
                      form.setValue("interval", "60");
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Back to presets
                  </button>
                </div>
              )}
              <FormDescription className="text-xs">
                {isCustomInterval 
                  ? "Enter custom interval in seconds (minimum 10 seconds)"
                  : "How often to check the service status"
                }
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="retries"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Retry Attempts</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 attempt</SelectItem>
                    <SelectItem value="2">2 attempts</SelectItem>
                    <SelectItem value="3">3 attempts</SelectItem>
                    <SelectItem value="5">5 attempts</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription className="text-xs">
                Number of retry attempts before marking as down
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}