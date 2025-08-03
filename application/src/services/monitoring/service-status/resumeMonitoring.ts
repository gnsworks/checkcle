
import { pb } from '@/lib/pocketbase';
import { monitoringIntervals } from '../monitoringIntervals';
import { Service } from '@/types/service.types';
import { startMonitoringService } from './startMonitoring';

/**
 * Specifically resume a paused service
 */
export async function resumeMonitoring(serviceId: string): Promise<void> {
  try {
    // Get current timestamp formatted as a string
    const now = new Date().toISOString();
    
    // Fetch the current service to get its name for better logging
    const service = await pb.collection('services').getOne(serviceId);
    
  //  console.log(`Resuming service ${service.name} at ${now}`);
    
    // First, clear any existing interval just to be safe
    const existingInterval = monitoringIntervals.get(serviceId);
    if (existingInterval) {
      clearInterval(existingInterval);
      monitoringIntervals.delete(serviceId);
    }
    
    // Update the service status to "up" in the database
    await pb.collection('services').update(serviceId, {
      status: "up",
      lastChecked: now,
      last_checked: now
    });
    
    // IMPORTANT: Wait a brief moment to ensure the status update is processed
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Now start the service monitoring with a clean slate
    await startMonitoringService(serviceId);
    
   // console.log(`Service ${service.name} resumed and ready for monitoring`);
  } catch (error) {
   // console.error("Error resuming service:", error);
  }
}