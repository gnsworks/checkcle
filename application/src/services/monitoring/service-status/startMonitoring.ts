
import { pb } from '@/lib/pocketbase';
import { monitoringIntervals } from '../monitoringIntervals';

/**
 * Start monitoring for a specific service
 */
export async function startMonitoringService(serviceId: string): Promise<void> {
  try {
    // First check if the service is already being monitored
    if (monitoringIntervals.has(serviceId)) {
     // console.log(`Service ${serviceId} is already being monitored`);
      return;
    }
    
    // Fetch the service to get its current configuration
    const service = await pb.collection('services').getOne(serviceId);
    
    // If service was manually paused, don't auto-resume
    if (service.status === "paused") {
    //  console.log(`Service ${serviceId} (${service.name}) is paused. Not starting monitoring.`);
      return;
    }
    
  //  console.log(`Starting monitoring for service ${serviceId} (${service.name})`);
    
    // Update the service status to active/up in the database
    await pb.collection('services').update(serviceId, {
      status: "up",
    });
    
    // The actual service checking is now handled by the Go microservice
    // This frontend service just tracks the monitoring state
    const intervalMs = (service.heartbeat_interval || 60) * 1000;
   // console.log(`Service ${service.name} monitoring delegated to backend service`);
    
    // Store a placeholder interval to track that this service is being monitored
    const intervalId = window.setInterval(() => {
    //  console.log(`Monitoring active for service ${service.name} (handled by backend)`);
    }, intervalMs);
    
    // Store the interval ID for this service
    monitoringIntervals.set(serviceId, intervalId);
    
   // console.log(`Monitoring registered for service ${serviceId}`);
  } catch (error) {
  //  console.error("Error starting service monitoring:", error);
  }
}