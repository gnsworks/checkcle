
import { Service } from "@/types/service.types";

/**
 * Prepare service for notification by converting from PocketBase format to our Service type
 */
export function prepareServiceForNotification(pbRecord: any, status: string, responseTime: number = 0): Service {
  // Extract notification channel and template IDs
  // Handle both naming conventions for backward compatibility
  const notificationChannel = pbRecord.notification_id || pbRecord.notificationChannel || null;
  const alertTemplate = pbRecord.template_id || pbRecord.alertTemplate || null;
  const muteAlerts = pbRecord.mute_alerts !== undefined ? pbRecord.mute_alerts : 
                    (pbRecord.muteAlerts !== undefined ? pbRecord.muteAlerts : false);
  
  console.log(`Preparing service for notification: ${pbRecord.name}, Mute Alerts: ${muteAlerts ? "YES" : "NO"}`);

  // Return a standardized Service object for notification
  return {
    id: pbRecord.id,
    name: pbRecord.name,
    url: pbRecord.url,
    host: pbRecord.host || "", // Include host property with fallback
    type: pbRecord.type || pbRecord.service_type || "HTTP",
    status: status as any,
    responseTime: responseTime,
    uptime: pbRecord.uptime || 0,
    lastChecked: new Date().toISOString(),
    interval: pbRecord.interval || pbRecord.heartbeat_interval || 60,
    retries: pbRecord.retries || pbRecord.max_retries || 3,
    notificationChannel,
    alertTemplate,
    muteAlerts
  };
}

// Utility function to add 'https://' to URLs if they don't have a protocol
export function ensureHttpsProtocol(url: string): string {
  // Check if the URL starts with a protocol
  if (!/^[a-z]+:\/\//i.test(url)) {
    // If not, prepend https://
    return `https://${url}`;
  }
  return url;
}

// Utility function to format a PocketBase record ID for display
export function formatRecordId(id: string): string {
  if (!id) return '';
  
  // Return the first 8 characters followed by '...'
  return id.length > 8 ? `${id.substring(0, 8)}...` : id;
}

/**
 * Format current time for display
 */
export function formatCurrentTime(): string {
  const now = new Date();
  return now.toISOString();
}