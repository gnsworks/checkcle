
// Re-export all SSL-related functionality for domain SSL checking
// Use explicit re-exports to avoid naming conflicts

// SSL Status utilities
export { determineSSLStatus } from './sslStatusUtils';

// Primary export for fetchSSLCertificates
export { fetchSSLCertificates } from './sslFetchService';

// Certificate operations
export { 
  addSSLCertificate,
  checkAndUpdateCertificate,
  deleteSSLCertificate,
  refreshAllCertificates
} from './sslCertificateOperations';

// SSL-specific notification service
export {
  checkAllCertificatesAndNotify,
  checkCertificateAndNotify,
  shouldRunDailyCheck,
  sendSSLNotification
} from './notification';

// Export types
export type { SSLCertificate, AddSSLCertificateDto, SSLNotification } from './types';

// Export utility functions for SSL operations
export { calculateDaysRemaining, isValid } from './utils';