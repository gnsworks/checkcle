
import { SSLTranslations } from '../types/ssl';

export const sslTranslations: SSLTranslations = {
  // Page and section titles
  sslDomainManagement: "SSL & Domain Management",
  monitorSSLCertificates: "Monitor and manage SSL certificates for your domains",
  addSSLCertificate: "Add SSL Certificate",
  editSSLCertificate: "Edit SSL Certificate",
  deleteSSLCertificate: "Delete SSL Certificate",
  sslCertificateDetails: "SSL Certificate Details",
  detailedInfo: "Detailed information for",
  viewDetailedInformation: "View detailed information for",

  // Status related
  valid: "Valid",
  expiringSoon: "Expiring Soon",
  expired: "Expired",
  pending: "Pending",

  // Statistics and cards
  validCertificates: "Valid Certificates",
  expiringSoonCertificates: "Expiring Soon",
  expiredCertificates: "Expired Certificates",

  // Form fields
  domain: "Domain",
  domainName: "Domain Name",
  domainCannotChange: "Domain cannot be changed after creation",
  warningThreshold: "Warning Threshold",
  warningThresholdDays: "Warning Threshold (Days)",
  expiryThreshold: "Expiry Threshold",
  expiryThresholdDays: "Expiry Threshold (Days)",
  notificationChannel: "Notification Channel",
  chooseChannel: "Choose a notification channel",
  whereToSend: "Where to send notifications",
  daysBeforeExpiration: "Days before expiration to receive warnings",
  daysBeforeCritical: "Days before expiration to receive critical alerts",
  getNotifiedExpiration: "Get notified when certificate is about to expire",
  getNotifiedCritical: "Get notified when certificate is critically close to expiration",

  // Table headers and fields
  issuer: "Issuer",
  expirationDate: "Expiration Date",
  daysLeft: "Days Left",
  status: "Status",
  lastNotified: "Last Notified",
  actions: "Actions",
  validFrom: "Valid From",
  validUntil: "Valid Until",
  validityDays: "Validity Days",
  validityPeriod: "Validity Period",
  organization: "Organization",
  commonName: "Common Name",
  serialNumber: "Serial Number",
  algorithm: "Algorithm",
  subjectAltNames: "Subject Alternative Names",
  subjectAlternativeNames: "Subject Alternative Names",
  resolvedIP: "Resolved IP",
  issuedTo: "Issued To",
  days: "days",
  
  // Buttons and actions
  addDomain: "Add Domain",
  refreshAll: "Refresh All",
  cancel: "Cancel",
  addCertificate: "Add Certificate",
  check: "Check",
  view: "View",
  edit: "Edit",
  delete: "Delete",
  close: "Close",
  saveChanges: "Save Changes",
  updating: "Updating",
  
  // Sections in detail view
  basicInformation: "Basic Information",
  validity: "Validity",
  issuerInfo: "Issuer Information",
  technicalDetails: "Technical Details",
  technicalInformation: "Technical Information",
  monitoringConfig: "Monitoring Configuration",
  monitoringConfiguration: "Monitoring Configuration",
  recordInfo: "Record Information",
  certificateDetails: "Certificate Details",
  
  // Notifications and messages
  sslCertificateAdded: "SSL Certificate added successfully",
  sslCertificateUpdated: "SSL Certificate updated successfully",
  sslCertificateDeleted: "SSL Certificate deleted successfully",
  sslCertificateRefreshed: "SSL Certificate for {domain} refreshed successfully",
  allCertificatesRefreshed: "All {count} certificates refreshed successfully",
  someCertificatesFailed: "{success} certificates refreshed, {failed} failed",
  failedToAddCertificate: "Failed to add SSL certificate",
  failedToLoadCertificates: "Failed to load SSL certificates",
  failedToUpdateCertificate: "Failed to update SSL certificate",
  failedToDeleteCertificate: "Failed to delete SSL certificate",
  failedToCheckCertificate: "Failed to check SSL certificate",
  noCertificatesToRefresh: "No certificates to refresh",
  startingRefreshAll: "Starting refresh of {count} certificates",
  checkingSSLCertificate: "Checking SSL certificate...",
  deleteConfirmation: "Are you sure you want to delete the certificate for",
  deleteWarning: "This action cannot be undone. This will permanently delete the certificate.",
  
  // Misc
  unknown: "Unknown",
  never: "Never",
  none: "None",
  loadingChannels: "Loading channels...",
  noChannelsFound: "No notification channels found",
  noSSLCertificates: "No SSL certificates found",
  created: "Created",
  lastUpdated: "Last Updated",
  lastNotification: "Last Notification",
  collectionId: "Collection ID"
};
