
import { Badge } from "@/components/ui/badge";

interface ServerStatusBadgeProps {
  status: 'up' | 'down' | 'warning';
}

export const ServerStatusBadge = ({ status }: ServerStatusBadgeProps) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'up':
        return {
          label: 'Online',
          className: 'bg-green-100 text-green-800 border-green-200'
        };
      case 'down':
        return {
          label: 'Offline',
          className: 'bg-red-100 text-red-800 border-red-200'
        };
      case 'warning':
        return {
          label: 'Warning',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
      default:
        return {
          label: 'Unknown',
          className: 'bg-gray-100 text-gray-800 border-gray-200'
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