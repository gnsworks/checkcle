
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PlaceholdersTabContentProps {
  control: Control<any>;
}

export const PlaceholdersTabContent: React.FC<PlaceholdersTabContentProps> = ({ control }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Template Placeholders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="service_name_placeholder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Name Placeholder</FormLabel>
                  <FormControl>
                    <Input placeholder="${service_name}" {...field} />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Used for service name in messages
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={control}
              name="response_time_placeholder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Response Time Placeholder</FormLabel>
                  <FormControl>
                    <Input placeholder="${response_time}" {...field} />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Used for response time in milliseconds
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          
            <FormField
              control={control}
              name="status_placeholder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status Placeholder</FormLabel>
                  <FormControl>
                    <Input placeholder="${status}" {...field} />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Used for service status (UP, DOWN, etc.)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={control}
              name="url_placeholder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL Placeholder</FormLabel>
                  <FormControl>
                    <Input placeholder="${url}" {...field} />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Used for service URL
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="host_placeholder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Host/IP Placeholder</FormLabel>
                  <FormControl>
                    <Input placeholder="${host}" {...field} />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Used for service host or IP address
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="service_type_placeholder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Type Placeholder</FormLabel>
                  <FormControl>
                    <Input placeholder="${service_type}" {...field} />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Used for service type (HTTP, PING, TCP, DNS)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="port_placeholder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Port Placeholder</FormLabel>
                  <FormControl>
                    <Input placeholder="${port}" {...field} />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Used for service port number
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="domain_placeholder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Domain Placeholder</FormLabel>
                  <FormControl>
                    <Input placeholder="${domain}" {...field} />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Used for domain name (DNS services)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="region_name_placeholder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Region Name Placeholder</FormLabel>
                  <FormControl>
                    <Input placeholder="${region_name}" {...field} />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Used for regional agent name
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="agent_id_placeholder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Agent ID Placeholder</FormLabel>
                  <FormControl>
                    <Input placeholder="${agent_id}" {...field} />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Used for regional agent ID
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="uptime_placeholder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Uptime Placeholder</FormLabel>
                  <FormControl>
                    <Input placeholder="${uptime}" {...field} />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Used for service uptime percentage
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={control}
              name="time_placeholder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time Placeholder</FormLabel>
                  <FormControl>
                    <Input placeholder="${time}" {...field} />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Used for current date and time
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Placeholder Usage Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            These placeholders will be replaced with actual values when notifications are sent:
          </p>
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-muted/30 p-2 rounded">
                <code className="text-xs">${"{service_name}"}</code>
                <p className="text-xs text-muted-foreground mt-1">The name of the service</p>
              </div>
              <div className="bg-muted/30 p-2 rounded">
                <code className="text-xs">${"{response_time}"}</code>
                <p className="text-xs text-muted-foreground mt-1">Response time in milliseconds</p>
              </div>
              <div className="bg-muted/30 p-2 rounded">
                <code className="text-xs">${"{status}"}</code>
                <p className="text-xs text-muted-foreground mt-1">Service status (UP, DOWN)</p>
              </div>
              <div className="bg-muted/30 p-2 rounded">
                <code className="text-xs">${"{url}"}</code>
                <p className="text-xs text-muted-foreground mt-1">Service URL</p>
              </div>
              <div className="bg-muted/30 p-2 rounded">
                <code className="text-xs">${"{host}"}</code>
                <p className="text-xs text-muted-foreground mt-1">Service host or IP address</p>
              </div>
              <div className="bg-muted/30 p-2 rounded">
                <code className="text-xs">${"{service_type}"}</code>
                <p className="text-xs text-muted-foreground mt-1">Service type (HTTP, PING, TCP, DNS)</p>
              </div>
              <div className="bg-muted/30 p-2 rounded">
                <code className="text-xs">${"{port}"}</code>
                <p className="text-xs text-muted-foreground mt-1">Service port number</p>
              </div>
              <div className="bg-muted/30 p-2 rounded">
                <code className="text-xs">${"{domain}"}</code>
                <p className="text-xs text-muted-foreground mt-1">Domain name (DNS services)</p>
              </div>
              <div className="bg-muted/30 p-2 rounded">
                <code className="text-xs">${"{region_name}"}</code>
                <p className="text-xs text-muted-foreground mt-1">Regional agent name</p>
              </div>
              <div className="bg-muted/30 p-2 rounded">
                <code className="text-xs">${"{agent_id}"}</code>
                <p className="text-xs text-muted-foreground mt-1">Regional agent ID</p>
              </div>
              <div className="bg-muted/30 p-2 rounded">
                <code className="text-xs">${"{uptime}"}</code>
                <p className="text-xs text-muted-foreground mt-1">Service uptime percentage</p>
              </div>
              <div className="bg-muted/30 p-2 rounded">
                <code className="text-xs">${"{time}"}</code>
                <p className="text-xs text-muted-foreground mt-1">Current date and time</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};