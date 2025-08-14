
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Control } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SslTemplateFieldsProps {
  control: Control<any>;
}

export const SslTemplateFields: React.FC<SslTemplateFieldsProps> = ({ control }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">SSL Certificate Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <FormField
              control={control}
              name="expired"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Certificate Expired Message</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="SSL certificate for ${domain} has EXPIRED on ${expiry_date}"
                      className="min-h-24"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={control}
              name="exiring_soon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Certificate Expiring Soon Message</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="SSL certificate for ${domain} will expire in ${days_left} days on ${expiry_date}"
                      className="min-h-24"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={control}
              name="warning"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Certificate Warning Message</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Warning: SSL certificate for ${domain} requires attention"
                      className="min-h-24"
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