
import { monitoringIntervals } from './monitoringIntervals';
import { 
  startMonitoringService, 
  pauseMonitoring, 
  resumeMonitoring, 
  startAllActiveServices 
} from './service-status';

export const monitoringService = {
  startMonitoringService,
  pauseMonitoring,
  resumeMonitoring,
  startAllActiveServices
};