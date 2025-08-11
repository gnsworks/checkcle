
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Control } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ServerTemplateFieldsProps {
  control: Control<any>;
}

export const ServerTemplateFields: React.FC<ServerTemplateFieldsProps> = ({ control }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">System Resource Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="cpu_message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPU Alert Message</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="CPU usage on ${server_name} is ${cpu_usage}% (threshold: ${threshold}%)"
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
              name="ram_message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RAM Alert Message</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Memory usage on ${server_name} is ${ram_usage}% (threshold: ${threshold}%)"
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
              name="disk_message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Disk Alert Message</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Disk usage on ${server_name} is ${disk_usage}% (threshold: ${threshold}%)"
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
              name="network_message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Network Alert Message</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Network usage on ${server_name} is ${network_usage}% (threshold: ${threshold}%)"
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

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">System Resource Restore Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="restore_cpu_message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPU Restore Message</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="CPU usage on ${server_name} has returned to normal: ${cpu_usage}%"
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
              name="restore_ram_message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RAM Restore Message</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Memory usage on ${server_name} has returned to normal: ${ram_usage}%"
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
              name="restore_disk_message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Disk Restore Message</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Disk usage on ${server_name} has returned to normal: ${disk_usage}%"
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
              name="restore_network_message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Network Restore Message</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Network usage on ${server_name} has returned to normal: ${network_usage}%"
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

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="up_message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Server Up Message</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Server ${server_name} is UP and responding"
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
                  <FormLabel>Server Down Message</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Server ${server_name} is DOWN"
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
                      placeholder="Warning: Server ${server_name} requires attention"
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
              name="paused_message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Paused Message</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Monitoring for server ${server_name} is paused"
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
              name="cpu_temp_message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPU Temperature Message</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="CPU temperature on ${server_name} is ${cpu_temp}°C"
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
              name="disk_io_message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Disk I/O Message</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Disk I/O on ${server_name} is ${disk_io} MB/s"
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
              name="restore_cpu_temp_message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPU Temperature Restore Message</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="CPU temperature on ${server_name} has returned to normal: ${cpu_temp}°C"
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
              name="restore_disk_io_message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Disk I/O Restore Message</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Disk I/O on ${server_name} has returned to normal: ${disk_io} MB/s"
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