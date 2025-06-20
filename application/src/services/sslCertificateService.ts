
// This file re-exports all SSL certificate related services for backward compatibility
import { 
  fetchSSLCertificates,
  addSSLCertificate,
  checkAndUpdateCertificate,
  triggerImmediateCheck,
  deleteSSLCertificate
} from './ssl';

import { determineSSLStatus } from './ssl/sslStatusUtils';

// Import from the new refactored location
import {
  checkAllCertificatesAndNotify,
  checkCertificateAndNotify,
  shouldRunDailyCheck
} from './ssl/notification';

export {
  determineSSLStatus,
  fetchSSLCertificates,
  addSSLCertificate,
  checkAndUpdateCertificate,
  triggerImmediateCheck,
  deleteSSLCertificate,
  checkAllCertificatesAndNotify,
  checkCertificateAndNotify,
  shouldRunDailyCheck
};