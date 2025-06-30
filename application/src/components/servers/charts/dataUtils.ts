
export const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const parseValueWithUnit = (value: string | number): { numeric: number; unit: string; original: string } => {
  if (typeof value === 'number') {
    return { numeric: value, unit: 'B', original: value.toString() };
  }
  
  const str = value.toString();
  const match = str.match(/^([\d.]+)\s*([A-Za-z%]*)/);
  if (match) {
    const numeric = parseFloat(match[1]);
    const unit = match[2] || '';
    return { numeric, unit, original: str };
  }
  return { numeric: 0, unit: '', original: str };
};

export const convertToBytes = (value: string | number): number => {
  if (typeof value === 'number') return value;
  
  const parsed = parseValueWithUnit(value);
  const multipliers: { [key: string]: number } = {
    'B': 1,
    'KB': 1024,
    'MB': 1024 * 1024,
    'GB': 1024 * 1024 * 1024,
    'TB': 1024 * 1024 * 1024 * 1024
  };
  
  const multiplier = multipliers[parsed.unit.toUpperCase()] || 1;
  return parsed.numeric * multiplier;
};

type TimeRange = '60m' | '1d' | '7d' | '1m' | '3m';

export const timeRangeOptions = [
  { value: '60m' as TimeRange, label: '60 minutes', hours: 1 },
  { value: '1d' as TimeRange, label: '1 day', hours: 24 },
  { value: '7d' as TimeRange, label: '7 days', hours: 24 * 7 },
  { value: '1m' as TimeRange, label: '1 month', hours: 24 * 30 },
  { value: '3m' as TimeRange, label: '3 months', hours: 24 * 90 },
];

export const filterMetricsByTimeRange = (metrics: any[], timeRange: TimeRange): any[] => {
  const now = new Date();
  const selectedRange = timeRangeOptions.find(opt => opt.value === timeRange);
  if (!selectedRange) return metrics;

  const cutoffTime = new Date(now.getTime() - (selectedRange.hours * 60 * 60 * 1000));
  
  return metrics.filter(metric => {
    const metricTime = new Date(metric.timestamp);
    return metricTime >= cutoffTime;
  });
};

export const formatChartData = (metrics: any[], timeRange: TimeRange) => {
  const filteredMetrics = filterMetricsByTimeRange(metrics, timeRange);
  
  return filteredMetrics.slice(0, 100).reverse().map((metric, index) => {
    const cpuUsage = typeof metric.cpu_usage === 'string' ? 
      parseFloat(metric.cpu_usage.replace('%', '')) : 
      parseFloat(metric.cpu_usage) || 0;

    const ramUsedBytes = convertToBytes(metric.ram_used);
    const ramTotalBytes = convertToBytes(metric.ram_total);
    const ramFreeBytes = convertToBytes(metric.ram_free);
    const ramUsagePercent = ramTotalBytes > 0 ? (ramUsedBytes / ramTotalBytes) * 100 : 0;

    const diskUsedBytes = convertToBytes(metric.disk_used);
    const diskTotalBytes = convertToBytes(metric.disk_total);
    const diskFreeBytes = convertToBytes(metric.disk_free);
    const diskUsagePercent = diskTotalBytes > 0 ? (diskUsedBytes / diskTotalBytes) * 100 : 0;

    const networkRxBytes = metric.network_rx_bytes || 0;
    const networkTxBytes = metric.network_tx_bytes || 0;
    const networkRxSpeed = metric.network_rx_speed || 0;
    const networkTxSpeed = metric.network_tx_speed || 0;

    return {
      timestamp: new Date(metric.timestamp).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      cpuUsage: Math.round(cpuUsage * 100) / 100,
      cpuCores: parseInt(metric.cpu_cores) || 0,
      cpuFree: 100 - cpuUsage,
      
      ramUsedBytes,
      ramTotalBytes,
      ramFreeBytes,
      ramUsed: formatBytes(ramUsedBytes),
      ramTotal: formatBytes(ramTotalBytes),
      ramFree: formatBytes(ramFreeBytes),
      ramUsagePercent: Math.round(ramUsagePercent * 100) / 100,
      
      diskUsedBytes,
      diskTotalBytes,
      diskFreeBytes,
      diskUsed: formatBytes(diskUsedBytes),
      diskTotal: formatBytes(diskTotalBytes),
      diskFree: formatBytes(diskFreeBytes),
      diskUsagePercent: Math.round(diskUsagePercent * 100) / 100,
      
      networkRxBytes,
      networkTxBytes,
      networkRx: formatBytes(networkRxBytes),
      networkTx: formatBytes(networkTxBytes),
      networkRxSpeed: Math.round(networkRxSpeed * 100) / 100,
      networkTxSpeed: Math.round(networkTxSpeed * 100) / 100,
    };
  });
};