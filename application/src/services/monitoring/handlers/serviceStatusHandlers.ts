
import { pb } from '@/lib/pocketbase';
import { uptimeService } from '@/services/uptimeService';
import { prepareServiceForNotification } from '../utils/httpUtils';
import { UptimeData } from '@/types/service.types';

/**
 * Handle a service that is determined to be UP
 */
export async function handleServiceUp(service: any, responseTime: number, formattedTime: string): Promise<void> {
 // console.log(`Service ${service.name} is UP! Response time: ${responseTime}ms`);
  
  // Create a history record of this check with a more accurate timestamp
  const uptimeData: UptimeData = {
    service_id: service.id, // Include service_id
    serviceId: service.id, // Keep for backward compatibility
    timestamp: new Date().toISOString(),
    status: "up",
    responseTime: responseTime,
    // Include required properties from the UptimeData interface
    date: new Date().toISOString(),
    uptime: 100
  };
  
  const previousStatus = service.status;
  const statusChanged = previousStatus !== "up" && previousStatus !== "paused";
  
  try {
    // Run service status update
    await pb.collection('services').update(service.id, {
      last_checked: formattedTime,
      response_time: responseTime,
      status: "up",
      // Calculate uptime percentage based on previous checks (simple moving average)
      uptime: service.uptime ? 
        (service.uptime * 0.9 + 100 * 0.1) : 100,
    });
    
    // Try to record uptime data, with retry logic
    try {
      await uptimeService.recordUptimeData(uptimeData);
    } catch (error) {
     // console.error("Failed to record uptime data on first try, retrying...", error);
      // Wait a short time and retry once
      await new Promise(resolve => setTimeout(resolve, 1000));
      await uptimeService.recordUptimeData(uptimeData);
    }
    
    // Status change logging (notification logic removed - will be handled by backend)
    if (statusChanged) {
     // console.log(`Status changed from ${previousStatus} to UP - notification will be handled by backend`);
    }
  } catch (error) {
  //  console.error("Error handling service UP state:", error);
  }
}

/**
 * Handle a service that is determined to be DOWN
 */
export async function handleServiceDown(service: any, formattedTime: string): Promise<void> {
 // console.log(`Service ${service.name} is DOWN!`);
  
  // Create a history record of this check
  const uptimeData: UptimeData = {
    service_id: service.id, // Include service_id
    serviceId: service.id, // Keep for backward compatibility
    timestamp: new Date().toISOString(),
    status: "down",
    responseTime: 0,
    // Include required properties from the UptimeData interface
    date: new Date().toISOString(),
    uptime: 0
  };
  
  const previousStatus = service.status;
  const statusChanged = previousStatus !== "down";
  
 // console.log(`Service ${service.name} previous status: ${previousStatus}, statusChanged: ${statusChanged}`);
  
  try {
    // Update service status
    await pb.collection('services').update(service.id, {
      last_checked: formattedTime,
      response_time: 0,
      status: "down",
      // Calculate uptime percentage based on previous checks
      uptime: service.uptime ? 
        (service.uptime * 0.9 + 0 * 0.1) : 0,
    });
    
    // Try to record uptime data with retry logic
    try {
      await uptimeService.recordUptimeData(uptimeData);
    } catch (error) {
    //  console.error("Failed to record uptime data on first try, retrying...", error);
      // Wait a short time and retry once
      await new Promise(resolve => setTimeout(resolve, 1000));
      await uptimeService.recordUptimeData(uptimeData);
    }
    
    // Status change logging (notification logic removed - will be handled by backend)
   // console.log("Service DOWN status recorded - notification will be handled by backend");
  } catch (error) {
   // console.error("Error handling service DOWN state:", error);
  }
}