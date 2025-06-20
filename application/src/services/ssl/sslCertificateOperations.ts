
import { pb } from "@/lib/pocketbase";
import type { AddSSLCertificateDto, SSLCertificate } from "./types";
import { determineSSLStatus } from "./sslStatusUtils";
import { checkCertificateAndNotify } from "./notification"; // Import notification service
import { toast } from "sonner";

/**
 * Add a new SSL certificate to monitor
 * Note: SSL checking is now handled by the Go service
 */
export const addSSLCertificate = async (
  certificateData: AddSSLCertificateDto
): Promise<SSLCertificate> => {
  try {
    // Prepare the data for saving to database
    // The Go service will handle the actual SSL checking
    const data = {
      domain: certificateData.domain,
      issued_to: certificateData.domain, // Will be updated by Go service
      issuer_o: "", // Will be updated by Go service
      status: "pending", // Initial status
      cert_sans: "",
      cert_alg: "",
      serial_number: "",
      valid_from: new Date().toISOString(), // Will be updated by Go service
      valid_till: new Date().toISOString(), // Will be updated by Go service
      validity_days: 0, // Will be updated by Go service
      days_left: 0, // Will be updated by Go service
      warning_threshold: Number(certificateData.warning_threshold) || 30,
      expiry_threshold: Number(certificateData.expiry_threshold) || 7,
      notification_channel: certificateData.notification_channel || "",
    };

    // Save to database
    const record = await pb.collection("ssl_certificates").create(data);

    return record as unknown as SSLCertificate;
  } catch (error) {
    console.error("Error adding SSL certificate:", error);
    throw error;
  }
};

/**
 * Check and update a specific SSL certificate
 * Note: This now relies on the Go service for SSL data fetching
 */
export const checkAndUpdateCertificate = async (
  certificateId: string
): Promise<SSLCertificate> => {
  try {
    // Get the certificate from database
    const certificate = await pb.collection("ssl_certificates").getOne(certificateId);

    if (!certificate) {
      throw new Error(`Certificate with ID ${certificateId} not found`);
    }

    const typedCertificate = certificate as unknown as SSLCertificate;
    
    // The Go service will handle the actual SSL checking and updating
    // For now, we'll just trigger notifications based on current data
    await checkCertificateAndNotify(typedCertificate);
    
    // Return the current certificate data
    return typedCertificate;
  } catch (error) {
    console.error("Error updating SSL certificate:", error);
    throw error;
  }
};

/**
 * Delete an SSL certificate from monitoring
 */
export const deleteSSLCertificate = async (id: string): Promise<boolean> => {
  try {
    await pb.collection("ssl_certificates").delete(id);
    return true;
  } catch (error) {
    console.error("Error deleting SSL certificate:", error);
    throw error;
  }
};

/**
 * Refresh all SSL certificates
 * Note: The Go service handles the actual SSL checking
 */
export const refreshAllCertificates = async (): Promise<{ success: number; failed: number }> => {
  try {
    const response = await pb.collection("ssl_certificates").getList(1, 100);
    const certificates = response.items as unknown as SSLCertificate[];

    console.log(`Refreshing ${certificates.length} certificates...`);

    let success = 0;
    let failed = 0;

    for (const cert of certificates) {
      try {
        await checkCertificateAndNotify(cert);
        success++;
      } catch (error) {
        console.error(`Failed to refresh certificate ${cert.domain}:`, error);
        failed++;
      }
    }

    return { success, failed };
  } catch (error) {
    console.error("Error refreshing certificates:", error);
    throw error;
  }
};