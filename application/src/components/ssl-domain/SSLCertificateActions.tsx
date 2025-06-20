
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, RefreshCw, Edit, Trash2 } from "lucide-react";
import { SSLCertificate } from "@/types/ssl.types";
import { triggerImmediateCheck } from "@/services/sslCertificateService";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

interface SSLCertificateActionsProps {
  certificate: SSLCertificate;
  onEdit: (certificate: SSLCertificate) => void;
  onDelete: (certificate: SSLCertificate) => void;
}

export const SSLCertificateActions = ({ 
  certificate, 
  onEdit, 
  onDelete 
}: SSLCertificateActionsProps) => {
  const { t } = useLanguage();

  const handleCheck = async () => {
    try {
      await triggerImmediateCheck(certificate.id);
    } catch (error) {
      console.error("Error triggering SSL check:", error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleCheck}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Check
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit(certificate)}>
          <Edit className="mr-2 h-4 w-4" />
          {t('edit')}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onDelete(certificate)}
          className="text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {t('delete')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};