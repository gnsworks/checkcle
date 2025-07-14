
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
  { value: '60m' as TimeRange, label: 'Last 60 minutes', hours: 1 },
  { value: '1d' as TimeRange, label: 'Last 24 hours', hours: 24 },
  { value: '7d' as TimeRange, label: 'Last 7 days', hours: 24 * 7 },
  { value: '1m' as TimeRange, label: 'Last 30 days', hours: 24 * 30 },
  { value: '3m' as TimeRange, label: 'Last 90 days', hours: 24 * 90 },
];

// Optimized time range filtering with early returns
export const filterMetricsByTimeRange = (metrics: any[], timeRange: TimeRange): any[] => {
  if (!metrics?.length) return [];
  
  const now = new Date();
  const selectedRange = timeRangeOptions.find(opt => opt.value === timeRange);
  if (!selectedRange) return metrics;

  // Add small buffer to avoid edge cases
  const bufferMinutes = timeRange === '60m' ? 5 : timeRange === '1d' ? 30 : 60;
  const cutoffTime = new Date(now.getTime() - (selectedRange.hours * 60 * 60 * 1000) - (bufferMinutes * 60 * 1000));
  
//  console.log('filterMetricsByTimeRange: timeRange:', timeRange, 'cutoffTime:', cutoffTime.toISOString());
  
  const filtered = metrics.filter(metric => {
    const metricTime = new Date(metric.created || metric.timestamp);
    return metricTime >= cutoffTime && metricTime <= now;
  });
  
//  console.log('filterMetricsByTimeRange: Filtered', metrics.length, 'to', filtered.length, 'metrics');
  
  // Sort by timestamp for proper chart display
  return filtered.sort((a, b) => 
    new Date(a.created || a.timestamp).getTime() - new Date(b.created || b.timestamp).getTime()
  );
};

// Optimized timestamp formatting with caching
const timestampCache = new Map<string, string>();

const formatTimestamp = (timestamp: string, timeRange: TimeRange): string => {
  const cacheKey = `${timestamp}-${timeRange}`;
  if (timestampCache.has(cacheKey)) {
    return timestampCache.get(cacheKey)!;
  }
  
  const date = new Date(timestamp);
  let formatted: string;
  
  if (timeRange === '60m') {
    formatted = date.toLocaleString('en-US', { 
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  } else if (timeRange === '1d') {
    formatted = date.toLocaleString('en-US', { 
      month: 'short',
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    });
  } else if (timeRange === '7d') {
    formatted = date.toLocaleString('en-US', { 
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      hour12: false
    });
  } else {
    formatted = date.toLocaleString('en-US', { 
      month: 'short',
      day: 'numeric',
      year: '2-digit'
    });
  }
  
  // Cache the result (limit cache size)
  if (timestampCache.size > 1000) {
    timestampCache.clear();
  }
  timestampCache.set(cacheKey, formatted);
  
  return formatted;
};

// Optimized chart data formatting with better performance
export const formatChartData = (metrics: any[], timeRange: TimeRange) => {
//  console.log('formatChartData: Input metrics count:', metrics?.length || 0, 'timeRange:', timeRange);
  
  if (!metrics?.length) return [];
  
  const filteredMetrics = filterMetricsByTimeRange(metrics, timeRange);
//  console.log('formatChartData: After time filtering:', filteredMetrics?.length || 0, 'metrics');
  
  if (!filteredMetrics.length) return [];
  
  // Dynamic sampling based on time range and data volume
  let maxDataPoints: number;
  switch (timeRange) {
    case '60m': maxDataPoints = 60; break;   // 1 point per minute max
    case '1d': maxDataPoints = 144; break;   // 1 point per 10 minutes max
    case '7d': maxDataPoints = 168; break;   // 1 point per hour max
    case '1m': maxDataPoints = 120; break;   // 1 point per 6 hours max
    case '3m': maxDataPoints = 90; break;    // 1 point per day max
    default: maxDataPoints = 100;
  }
  
  // Smart sampling - only sample if we have significantly more data
  const sampledMetrics = filteredMetrics.length > maxDataPoints * 1.2
    ? filteredMetrics.filter((_, index) => index % Math.ceil(filteredMetrics.length / maxDataPoints) === 0)
    : filteredMetrics;
  
//  console.log('formatChartData: After sampling:', sampledMetrics.length, 'metrics for display');
  
  // Batch process the data transformation for better performance
  return sampledMetrics.map((metric) => {
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

    const timestamp = metric.created || metric.timestamp;

    return {
      timestamp: formatTimestamp(timestamp, timeRange),
      fullTimestamp: timestamp,
      cpuUsage: Math.round(cpuUsage * 100) / 100,
      cpuCores: parseInt(metric.cpu_cores) || 0,
      cpuFree: Math.round((100 - cpuUsage) * 100) / 100,
      
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