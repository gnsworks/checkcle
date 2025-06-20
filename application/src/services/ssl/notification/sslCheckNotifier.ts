
import { pb } from "@/lib/pocketbase";
import { SSLCertificate } from "../types";
import { determineSSLStatus } from "../sslStatusUtils";
import { sendSSLNotification } from "./sslNotificationSender";
import { toast } from "sonner";

/**
 * Checks all SSL certificates and sends notifications for expiring ones
 * This should be called once per day
 */
export async function checkAllCertificatesAndNotify(): Promise<void> {
  console.log("Starting daily SSL certificates check...");
  
  try {
    // Fetch all SSL certificates from database
    const response = await pb.collection('ssl_certificates').getList(1, 100, {});
    // Properly cast the items as SSLCertificate
    const certificates = response.items as unknown as SSLCertificate[];
    
    console.log(`Found ${certificates.length} certificates to check`);
    
    // Check each certificate
    for (const cert of certificates) {
      await checkCertificateAndNotify(cert);
    }
    
    console.log("Daily SSL certificates check completed");
  } catch (error) {
    console.error("Error during SSL certificates daily check:", error);
  }
}

/**
 * Checks a specific SSL certificate and sends notification if needed
 * This respects the Warning and Expiry Thresholds set on the certificate
 * Note: SSL checking is now handled by the Go service, this function focuses on notifications
 */
export async function checkCertificateAndNotify(certificate: SSLCertificate): Promise<boolean> {
  console.log(`Checking certificate for ${certificate.domain}...`);
  
  try {
    // Use the current certificate data (updated by Go service)
    const daysLeft = certificate.days_left || 0;
    
    // Get threshold values (ensure they are numbers)
    const warningThreshold = Number(certificate.warning_threshold) || 30;
    const expiryThreshold = Number(certificate.expiry_threshold) || 7;
    
    console.log(`Certificate ${certificate.domain} thresholds: warning=${warningThreshold}, expiry=${expiryThreshold}, days left=${daysLeft}`);
    
    // Update status based on thresholds
    const status = determineSSLStatus(daysLeft, warningThreshold, expiryThreshold);
    
    // Check if we should send a notification based on thresholds
    let shouldNotify = false;
    let isCritical = false;
    
    // Critical notifications - when days left is less than or equal to expiry threshold
    if (daysLeft <= expiryThreshold) {
      shouldNotify = true;
      isCritical = true;
    } 
    // Warning notifications - when days left is less than or equal to warning threshold but greater than expiry threshold
    else if (daysLeft <= warningThreshold) {
      shouldNotify = true;
      isCritical = false;
    }
    
    console.log(`${certificate.domain}: ${daysLeft} days left, status: ${status}, should notify: ${shouldNotify}, critical: ${isCritical}`);
    
    // Update certificate status in database
    await pb.collection('ssl_certificates').update(certificate.id, {
      status: status
    });
    
    // Send notification if needed
    if (shouldNotify && certificate.notification_channel) {
      console.log(`Sending notification for ${certificate.domain}`);
      
      // Different message based on expiry threshold
      const message = isCritical
        ? `🚨 CRITICAL: SSL Certificate for ${certificate.domain} will expire in ${daysLeft} days!`
        : `⚠️ WARNING: SSL Certificate for ${certificate.domain} will expire in ${daysLeft} days.`;
      
      // Send the notification using our specialized SSL notification sender
      const notificationSent = await sendSSLNotification(certificate, message, isCritical);
      
      if (notificationSent) {
        // Update last_notified timestamp
        await pb.collection('ssl_certificates').update(certificate.id, {
          last_notified: new Date().toISOString()
        });
        
        console.log(`Notification sent for ${certificate.domain}`);
        // Show toast for manual checks
        toast.success(`Notification sent for ${certificate.domain}`);
        return true;
      } else {
        console.error(`Failed to send notification for ${certificate.domain}`);
        // Show error toast for manual checks
        toast.error(`Failed to send notification for ${certificate.domain}`);
        return false;
      }
    } else if (shouldNotify && !certificate.notification_channel) {
      console.log(`No notification channel set for ${certificate.domain}, skipping notification`);
      toast.info(`No notification channel set for ${certificate.domain}, skipping notification`);
    } else {
      console.log(`No notification needed for ${certificate.domain} (${daysLeft} days left)`);
      // For manual checks, inform the user that thresholds weren't met
      toast.info(`Certificate for ${certificate.domain} is valid (${daysLeft} days left)`);
    }
    
    return true;
  } catch (error) {
    console.error(`Error checking certificate for ${certificate.domain}:`, error);
    toast.error(`Error checking certificate: ${error instanceof Error ? error.message : "Unknown error"}`);
    return false;
  }
}