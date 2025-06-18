
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { ServiceFormData } from "./types";

interface ServiceBasicFieldsProps {
  form: UseFormReturn<ServiceFormData>;
}

export function ServiceBasicFields({ form }: ServiceBasicFieldsProps) {
  return (
    <FormField
      control={form.control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Service Name</FormLabel>
          <FormControl>
            <Input 
              placeholder="Enter a descriptive name for your service" 
              {...field} 
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}