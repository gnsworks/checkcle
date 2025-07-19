
import { pb } from "@/lib/pocketbase";
import { SSLCertificate } from "@/types/ssl.types";

/**
 * Check a single SSL certificate - notifications are now handled by the backend
 */
export const checkCertificateAndNotify = async (certificate: SSLCertificate): Promise<void> => {
  try {
   // console.log(`Checking certificate for ${certificate.domain}...`);
    
    // The actual SSL checking and notifications are now handled by the Go service
    // We just need to trigger a check by updating the check_at timestamp
    
    const now = new Date();
    
    // Update check_at to trigger backend check
    await pb.collection('ssl_certificates').update(certificate.id, {
      check_at: now.toISOString()
    });
        
  } catch (error) {
    throw error;
  }
};

/**
 * Check all SSL certificates - backend handles the actual checking and notifications
 */
export const checkAllCertificatesAndNotify = async (): Promise<{ success: number; failed: number }> => {
  try {
  
    const response = await pb.collection('ssl_certificates').getList(1, 100);
    const certificates = response.items as unknown as SSLCertificate[];
        
    let success = 0;
    let failed = 0;
    
    for (const cert of certificates) {
      try {
        await checkCertificateAndNotify(cert);
        success++;
      } catch (error) {
        failed++;
      }
    }
    
    return { success, failed };
    
  } catch (error) {
    throw error;
  }
};