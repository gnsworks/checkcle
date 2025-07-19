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

export const filterMetricsByTimeRange = (metrics: any[], timeRange: TimeRange): any[] => {
  if (!metrics?.length) {
    console.log('🔍 filterMetricsByTimeRange: No metrics provided');
    return [];
  }
  
  console.log('🔍 filterMetricsByTimeRange: Starting with', metrics.length, 'metrics for', timeRange);
  
  const now = new Date();
  
  // For 60m, let's be very specific about what we're looking for
  if (timeRange === '60m') {
    console.log('⏰ 60m filter: Current time:', now.toISOString());
    
    // Try exact 60 minutes first
    const cutoffTime60m = new Date(now.getTime() - (60 * 60 * 1000));
    console.log('⏰ 60m filter: Cutoff time:', cutoffTime60m.toISOString());
    
    const filtered60m = metrics.filter(metric => {
      const metricTime = new Date(metric.created || metric.timestamp);
      const isWithinRange = metricTime >= cutoffTime60m && metricTime <= now;
      
      if (!isWithinRange) {
        const ageMinutes = Math.round((now.getTime() - metricTime.getTime()) / (1000 * 60));
        console.log('⏰ Excluding record:', {
          created: metric.created || metric.timestamp,
          ageMinutes: ageMinutes,
          reason: ageMinutes > 60 ? 'too old' : 'future date'
        });
      }
      
      return isWithinRange;
    });
    
    console.log('✅ 60m strict filter result:', filtered60m.length, 'records');
    
    if (filtered60m.length > 0) {
      return filtered60m.sort((a, b) => 
        new Date(a.created || a.timestamp).getTime() - new Date(b.created || b.timestamp).getTime()
      );
    }
    
    // If no data in exactly 60m, show what we have and return it anyway for debugging
    console.log('⚠️ No data in 60m range, showing all available data ages:');
    metrics.forEach((metric, index) => {
      const metricTime = new Date(metric.created || metric.timestamp);
      const ageMinutes = Math.round((now.getTime() - metricTime.getTime()) / (1000 * 60));
      console.log(`Record ${index}: ${metric.created || metric.timestamp} (${ageMinutes} minutes ago)`);
    });
    
    // Return the most recent data regardless of age
    const sorted = metrics.sort((a, b) => 
      new Date(b.created || b.timestamp).getTime() - new Date(a.created || a.timestamp).getTime()
    );
    console.log('🔄 Returning most recent available data for 60m view');
    return sorted.slice(0, 20); // Show last 20 records
  }
  
  // For other time ranges, use normal filtering
  const selectedRange = timeRangeOptions.find(opt => opt.value === timeRange);
  if (!selectedRange) return metrics;

  const cutoffTime = new Date(now.getTime() - (selectedRange.hours * 60 * 60 * 1000));
  
  const filtered = metrics.filter(metric => {
    const metricTime = new Date(metric.created || metric.timestamp);
    return metricTime >= cutoffTime && metricTime <= now;
  });
  
  console.log('✅ Filtered', metrics.length, 'to', filtered.length, 'metrics for', timeRange);
  
  return filtered.sort((a, b) => 
    new Date(a.created || a.timestamp).getTime() - new Date(b.created || b.timestamp).getTime()
  );
};

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
  
  if (timestampCache.size > 1000) {
    timestampCache.clear();
  }
  timestampCache.set(cacheKey, formatted);
  
  return formatted;
};

export const formatChartData = (metrics: any[], timeRange: TimeRange) => {
  console.log('📊 formatChartData: Processing', {
    inputCount: metrics?.length || 0,
    timeRange,
    sampleMetric: metrics?.[0] ? {
      id: metrics[0].id,
      created: metrics[0].created,
      timestamp: metrics[0].timestamp,
      server_id: metrics[0].server_id
    } : null
  });
  
  if (!metrics?.length) {
    console.log('❌ formatChartData: No metrics provided');
    return [];
  }
  
  const filteredMetrics = filterMetricsByTimeRange(metrics, timeRange);
  console.log('📊 formatChartData: After time filtering:', filteredMetrics?.length || 0, 'metrics');
  
  if (!filteredMetrics.length) {
    console.log('❌ formatChartData: No metrics after time filtering');
    return [];
  }
  
  // Dynamic sampling based on time range and data volume
  let maxDataPoints: number;
  switch (timeRange) {
    case '60m': maxDataPoints = 60; break;
    case '1d': maxDataPoints = 144; break;
    case '7d': maxDataPoints = 168; break;
    case '1m': maxDataPoints = 120; break;
    case '3m': maxDataPoints = 90; break;
    default: maxDataPoints = 100;
  }
  
  const sampledMetrics = filteredMetrics.length > maxDataPoints * 1.2
    ? filteredMetrics.filter((_, index) => index % Math.ceil(filteredMetrics.length / maxDataPoints) === 0)
    : filteredMetrics;
  
  console.log('📊 formatChartData: After sampling:', sampledMetrics.length, 'metrics for display');
  
  const formattedData = sampledMetrics.map((metric) => {
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
  
  console.log('✅ formatChartData: Final formatted data count:', formattedData.length);
  return formattedData;
};