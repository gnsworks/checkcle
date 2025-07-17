
import { useEffect, useRef } from "react";
import { pb } from "@/lib/pocketbase";
import { Service, UptimeData } from "@/types/service.types";

interface UseRealTimeUpdatesProps {
  serviceId: string | undefined;
  startDate: Date;
  endDate: Date;
  setService: React.Dispatch<React.SetStateAction<Service | null>>;
  setUptimeData: React.Dispatch<React.SetStateAction<UptimeData[]>>;
}

export const useRealTimeUpdates = ({
  serviceId,
  startDate,
  endDate,
  setService,
  setUptimeData
}: UseRealTimeUpdatesProps) => {
  const subscriptionsRef = useRef<{
    service?: () => void;
    uptime?: () => void;
  }>({});
  
  const lastUpdateRef = useRef<number>(0);
  const updateThrottleMs = 30000; // Throttle to once per 30 seconds for better performance

  // Listen for real-time updates to this service with throttling
  useEffect(() => {
    if (!serviceId) return;

   // console.log(`Setting up real-time updates for service: ${serviceId}`);
    
    const setupSubscriptions = async () => {
      try {
        // Clean up existing subscriptions first
        if (subscriptionsRef.current.service) {
          subscriptionsRef.current.service();
        }
        if (subscriptionsRef.current.uptime) {
          subscriptionsRef.current.uptime();
        }

        // Subscribe to the service record with throttling
        const serviceUnsubscribe = await pb.collection('services').subscribe(serviceId, function(e) {
          const now = Date.now();
          if (now - lastUpdateRef.current < updateThrottleMs) {
           // console.log("Service update throttled");
            return;
          }
          lastUpdateRef.current = now;
          
         // console.log("Service updated (throttled):", e.record);
          
          // Update our local state with the new data
          if (e.record) {
            setService(prev => {
              if (!prev) return null;
              return {
                ...prev,
                status: e.record.status || prev.status,
                responseTime: e.record.response_time || e.record.responseTime || prev.responseTime,
                uptime: e.record.uptime || prev.uptime,
                lastChecked: e.record.last_checked || e.record.lastChecked || prev.lastChecked,
              };
            });
          }
        });

        subscriptionsRef.current.service = serviceUnsubscribe;

        // Subscribe to uptime data updates with throttling
        const uptimeUnsubscribe = await pb.collection('uptime_data').subscribe('*', function(e) {
          if (!e.record || e.record.service_id !== serviceId) return;
          
          const now = Date.now();
          if (now - lastUpdateRef.current < updateThrottleMs) {
           // console.log("Uptime data update throttled");
            return;
          }
          lastUpdateRef.current = now;
          
         // console.log("New uptime data (throttled):", e.record);
          
          // Add the new uptime data to our list if it's within the selected date range
          const timestamp = new Date(e.record.timestamp);
          if (timestamp >= startDate && timestamp <= endDate) {
            setUptimeData(prev => {
              // Limit the array size to prevent memory issues
              const maxRecords = 100;
              const newData: UptimeData = {
                id: e.record.id,
                service_id: e.record.service_id,
                serviceId: e.record.service_id,
                timestamp: e.record.timestamp,
                status: e.record.status,
                responseTime: e.record.response_time || 0,
                date: e.record.timestamp,
                uptime: e.record.uptime || 0
              };
              
              // Add at the beginning and limit array size
              const updatedData = [newData, ...prev];
              return updatedData.slice(0, maxRecords);
            });
          }
        });

        subscriptionsRef.current.uptime = uptimeUnsubscribe;

      } catch (error) {
      //  console.error("Error setting up real-time updates:", error);
      }
    };

    setupSubscriptions();

    // Return cleanup function
    return () => {
    // console.log(`Cleaning up subscriptions for service: ${serviceId}`);
      try {
        if (subscriptionsRef.current.service) {
          subscriptionsRef.current.service();
        }
        if (subscriptionsRef.current.uptime) {
          subscriptionsRef.current.uptime();
        }
      } catch (error) {
       // console.error("Error cleaning up subscriptions:", error);
      }
    };
  }, [serviceId, startDate, endDate, setService, setUptimeData]);
};