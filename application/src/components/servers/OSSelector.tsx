import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface OSOption {
  value: string;
  name: string;
  logo: string; // now it's a path to image, e.g., /logos/ubuntu.svg
}

const osOptions: OSOption[] = [
  { value: "ubuntu", name: "Ubuntu", logo: "/upload/os/ubuntu.png" },
  { value: "debian", name: "Debian", logo: "/upload/os/debian.png" },
  { value: "centos", name: "CentOS", logo: "/upload/os/centos.png" },
  { value: "rhel", name: "Red Hat Enterprise Linux", logo: "/upload/os/rhel.png" },
  { value: "linux", name: "Linux (Generic)", logo: "/upload/os/linux.png" },
  { value: "windows", name: "Windows Server", logo: "/upload/os/windows.png" },
];

interface OSSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

export const OSSelector: React.FC<OSSelectorProps> = ({ value, onValueChange }) => {
  return (
    <div className="grid gap-2">
      {osOptions.map((os) => (
        <button
          key={os.value}
          type="button"
          onClick={() => onValueChange(os.value)}
          className={cn(
            "flex items-center justify-between w-full rounded-md border px-4 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground transition",
            value === os.value ? "bg-accent text-accent-foreground border-ring" : "border-input"
          )}
        >
          <div className="flex items-center gap-3">
            <img
              src={os.logo}
              alt={`${os.name} logo`}
              className="w-6 h-6 object-contain"
            />
            <span>{os.name}</span>
          </div>
          {value === os.value && <Check className="h-4 w-4" />}
        </button>
      ))}
    </div>
  );
};