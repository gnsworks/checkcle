
import { useTheme } from "@/contexts/ThemeContext";

export const useChartConfig = () => {
  const { theme } = useTheme();

  const chartConfig = {
    cpuUsage: {
      label: "CPU Usage (%)",
      color: theme === 'dark' ? "#60a5fa" : "#3b82f6",
    },
    ramUsagePercent: {
      label: "RAM Usage (%)",
      color: theme === 'dark' ? "#34d399" : "#10b981",
    },
    diskUsagePercent: {
      label: "Disk Usage (%)",
      color: theme === 'dark' ? "#fbbf24" : "#f59e0b",
    },
    networkRx: {
      label: "Network RX",
      color: theme === 'dark' ? "#a78bfa" : "#8b5cf6",
    },
    networkTx: {
      label: "Network TX",
      color: theme === 'dark' ? "#f87171" : "#ef4444",
    },
  };

  const getGridColor = () => theme === 'dark' ? '#374151' : '#e5e7eb';
  const getAxisColor = () => theme === 'dark' ? '#9ca3af' : '#6b7280';

  return { chartConfig, getGridColor, getAxisColor, theme };
};