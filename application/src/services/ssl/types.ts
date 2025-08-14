
// SSL Certificate DTO for adding new certificates
export interface AddSSLCertificateDto {
  domain: string;
  warning_threshold: number;
  expiry_threshold: number;
  notification_channel: string;
  alert_template?: string; // New field for SSL alert template
  notification_id?: string; // Multi notification channels as comma-separated string
  template_id?: string; // Alert template ID for PocketBase
  check_interval?: number; // New field for check interval in days
}

// SSL Certificate model
export interface SSLCertificate {
  id: string;
  domain: string;
  issued_to: string;
  issuer_o: string;
  status: string;
  cert_sans?: string;
  cert_alg?: string;
  serial_number?: number | string;
  valid_from: string;
  valid_till: string;
  validity_days: number;
  days_left: number;
  valid_days_to_expire?: number;
  warning_threshold: number;
  expiry_threshold: number;
  notification_channel: string;
  alert_template?: string; // New field for SSL alert template
  // PocketBase specific fields
  notification_id?: string; // Multi notification channels as comma-separated string
  template_id?: string; // Alert template ID for PocketBase
  last_notified?: string;
  created?: string;
  updated?: string;
  // New fields
  check_interval?: number; // Check interval in days
  check_at?: string; // Next check time
  // Existing fields based on the provided structure
  collectionId?: string;
  collectionName?: string;
  resolved_ip?: string;
  issuer_cn?: string;
}

// SSL specific notification types
export interface SSLNotification {
  certificateId: string;
  domain: string;
  message: string;
  isCritical: boolean;
  timestamp: string;
}