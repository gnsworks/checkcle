
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Control } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ServiceTemplateFieldsProps {
  control: Control<any>;
}

export const ServiceTemplateFields: React.FC<ServiceTemplateFieldsProps> = ({ control }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Service Status Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="up_message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Up Message</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Service ${service_name} is UP. Response time: ${response_time}ms"
                      className="min-h-20"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={control}
              name="down_message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Down Message</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Service ${service_name} is DOWN. Status: ${status}"
                      className="min-h-20"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={control}
              name="maintenance_message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maintenance Message</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Service ${service_name} is under maintenance"
                      className="min-h-20"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={control}
              name="incident_message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Incident Message</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Service ${service_name} has an incident"
                      className="min-h-20"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={control}
              name="resolved_message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resolved Message</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Issue with service ${service_name} has been resolved"
                      className="min-h-20"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={control}
              name="warning_message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Warning Message</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Warning: Service ${service_name} response time is high"
                      className="min-h-20"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};