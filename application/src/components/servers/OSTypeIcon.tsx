
import { Monitor, Server, Smartphone, Laptop } from "lucide-react";

interface OSTypeIconProps {
  osType: string;
  className?: string;
}

export const OSTypeIcon = ({ osType, className = "h-4 w-4" }: OSTypeIconProps) => {
  const getOSIcon = (os: string) => {
    const osLower = os.toLowerCase();
    
    if (osLower.includes('linux') || osLower.includes('ubuntu') || osLower.includes('centos')) {
      return <Server className={className} />;
    } else if (osLower.includes('windows')) {
      return <Monitor className={className} />;
    } else if (osLower.includes('mac') || osLower.includes('darwin')) {
      return <Laptop className={className} />;
    } else if (osLower.includes('android') || osLower.includes('ios')) {
      return <Smartphone className={className} />;
    } else {
      return <Server className={className} />;
    }
  };

  return getOSIcon(osType);
};