
import { Badge } from "@/components/ui/badge";

interface ServerStatusBadgeProps {
  status: 'up' | 'down' | 'warning' | 'paused';
}

export const ServerStatusBadge = ({ status }: ServerStatusBadgeProps) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'up':
        return {
          label: 'Online',
          className: 'bg-green-600 text-green-100 border-green-200'
        };
      case 'down':
        return {
          label: 'Offline',
          className: 'bg-red-600 text-red-100 border-red-200'
        };
      case 'warning':
        return {
          label: 'Warning',
          className: 'bg-yellow-600 text-yellow-800 border-yellow-200'
        };
        case 'paused':
        return {
          label: 'Paused',
          className: 'bg-gray-600 text-gray-100 border-gray-200'
        };
      default:
        return {
          label: 'Unknown',
          className: 'bg-gray-600 text-gray-100 border-gray-200'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
};