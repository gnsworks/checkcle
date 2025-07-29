
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

import { SSLCertificateStatusCards } from "./SSLCertificateStatusCards";
import { SSLCertificatesTable } from "./SSLCertificatesTable";
import { LoadingState } from "@/components/services/LoadingState";
import { fetchSSLCertificates, addSSLCertificate, checkAndUpdateCertificate, refreshAllCertificates, deleteSSLCertificate } from "@/services/ssl";
import { AddSSLCertificateForm } from "./AddSSLCertificateForm";
import { EditSSLCertificateForm } from "./EditSSLCertificateForm";
import type { AddSSLCertificateDto, SSLCertificate } from "@/types/ssl.types";
import { pb } from "@/lib/pocketbase";
import { useLanguage } from "@/contexts/LanguageContext";

export const SSLDomainContent = () => {
  const { t } = useLanguage();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);
  const [isRefreshingAll, setIsRefreshingAll] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<SSLCertificate | null>(null);
  const queryClient = useQueryClient();
  
  // Fetch SSL certificates with explicit error handling
  const { data: certificates = [], isLoading, error } = useQuery({
    queryKey: ['ssl-certificates'],
    queryFn: async () => {
      try {
       // console.log("Fetching SSL certificates from SSLDomainContent...");
        const result = await fetchSSLCertificates();
       // console.log("Received SSL certificates:", result);
        return result;
      } catch (error) {
       // console.error("Error fetching certificates:", error);
        toast.error(t('failedToLoadCertificates'));
        throw error;
      }
    },
    refetchOnWindowFocus: false,
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  // Add certificate mutation
  const addMutation = useMutation({
    mutationFn: addSSLCertificate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ssl-certificates'] });
      setIsAddDialogOpen(false);
      toast.success(t('sslCertificateAdded'));
    },
    onError: (error) => {
      console.error("Error adding SSL certificate:", error);
      toast.error(error instanceof Error ? error.message : t('failedToAddCertificate'));
    }
  });

  // Edit certificate mutation - Updated to ensure thresholds are properly updated
  const editMutation = useMutation({
    mutationFn: async (certificate: SSLCertificate) => {
     // console.log("Updating certificate with data:", certificate);
      
      // Create the update data object
      const updateData = {
        warning_threshold: Number(certificate.warning_threshold),
        expiry_threshold: Number(certificate.expiry_threshold),
        notification_channel: certificate.notification_channel,
      };
      
    //  console.log("Update data to be sent:", updateData);
      
      // Update certificate in the database using PocketBase directly
      const updated = await pb.collection('ssl_certificates').update(certificate.id, updateData);
      
    //  console.log("PocketBase update response:", updated);
      
      // After updating the settings, refresh the certificate to ensure it's up to date
      // This will also check if notification needs to be sent based on updated thresholds
      const refreshedCert = await checkAndUpdateCertificate(certificate.id);
      
      return refreshedCert;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ssl-certificates'] });
      setIsEditDialogOpen(false);
      setSelectedCertificate(null);
      toast.success(t('sslCertificateUpdated'));
    },
    onError: (error) => {
     // console.error("Error updating SSL certificate:", error);
      toast.error(error instanceof Error ? error.message : t('failedToUpdateCertificate'));
    }
  });

  // Delete certificate mutation
  const deleteMutation = useMutation({
    mutationFn: deleteSSLCertificate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ssl-certificates'] });
      toast.success(t('sslCertificateDeleted'));
    },
    onError: (error) => {
     // console.error("Error deleting SSL certificate:", error);
      toast.error(error instanceof Error ? error.message : t('failedToDeleteCertificate'));
    }
  });

  // Refresh certificate mutation - Updated to remove individual toast notifications
  const refreshMutation = useMutation({
    mutationFn: checkAndUpdateCertificate,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ssl-certificates'] });
      setRefreshingId(null);
      // Removed individual success toast notification
    },
    onError: (error) => {
    //  console.error("Error refreshing SSL certificate:", error);
      setRefreshingId(null);
      
      // Still refresh the data to show any partial information that was saved
      queryClient.invalidateQueries({ queryKey: ['ssl-certificates'] });
      // Removed individual error toast notification
    }
  });
  
  // Refresh all certificates mutation
  const refreshAllMutation = useMutation({
    mutationFn: refreshAllCertificates,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['ssl-certificates'] });
      setIsRefreshingAll(false);
      
      if (result.failed === 0) {
        toast.success(t('allCertificatesRefreshed').replace('{count}', result.success.toString()));
      } else {
        toast.info(t('someCertificatesFailed')
          .replace('{success}', result.success.toString())
          .replace('{failed}', result.failed.toString()));
      }
    },
    onError: (error) => {
    //  console.error("Error refreshing all certificates:", error);
      toast.error(t('failedToCheckCertificate'));
      setIsRefreshingAll(false);
      
      // Still refresh the data to show any partial information
      queryClient.invalidateQueries({ queryKey: ['ssl-certificates'] });
    }
  });

  const handleAddCertificate = async (data: AddSSLCertificateDto) => {
    addMutation.mutate(data);
  };

  const handleRefreshCertificate = (id: string) => {
    if (refreshingId) return; // Prevent multiple refreshes
    setRefreshingId(id);
    refreshMutation.mutate(id);
  };

  const handleEditCertificate = (certificate: SSLCertificate) => {
    setSelectedCertificate(certificate);
    setIsEditDialogOpen(true);
  };

  const handleUpdateCertificate = (certificate: SSLCertificate) => {
    console.log("Handling certificate update with data:", certificate);
    editMutation.mutate(certificate);
  };

  const handleDeleteCertificate = (certificate: SSLCertificate) => {
    deleteMutation.mutate(certificate.id);
  };

  const handleRefreshAll = async () => {
    if (certificates.length === 0) {
      toast.info(t('noCertificatesToRefresh'));
      return;
    }
    
    setIsRefreshingAll(true);
    toast.info(t('startingRefreshAll').replace('{count}', certificates.length.toString()));
    refreshAllMutation.mutate();
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-foreground">
        <p>{t('failedToLoadCertificates')}</p>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['ssl-certificates'] })}>
          {t('check')}
        </Button>
      </div>
    );
  }

  return (
    <main className="flex-1 flex flex-col overflow-auto bg-background p-6 pb-0">
      <div className="flex flex-col flex-1">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{t('sslDomainManagement')}</h2>
            <p className="text-sm text-muted-foreground mt-1">{t('monitorSSLCertificates')}</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={handleRefreshAll}
              disabled={isRefreshingAll || refreshingId !== null}
              className="relative"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshingAll ? 'animate-spin' : ''}`} /> 
              {t('refreshAll')}
              {isRefreshingAll && (
                <span className="absolute top-0 right-0 -mt-2 -mr-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  ...
                </span>
              )}
            </Button>
            <Button 
              className="text-primary-foreground"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" /> {t('addDomain')}
            </Button>
          </div>
        </div>
        
        <SSLCertificateStatusCards certificates={certificates} />
        
        <div className="mt-6 flex-1 flex flex-col pb-6">
          <SSLCertificatesTable />
        </div>
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('addSSLCertificate')}</DialogTitle>
          </DialogHeader>
          <AddSSLCertificateForm 
            onSubmit={handleAddCertificate} 
            onCancel={() => setIsAddDialogOpen(false)} 
            isPending={addMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {selectedCertificate && (
        <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) setSelectedCertificate(null);
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('editSSLCertificate')}</DialogTitle>
            </DialogHeader>
            <EditSSLCertificateForm 
              certificate={selectedCertificate}
              onSubmit={handleUpdateCertificate}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setSelectedCertificate(null);
              }}
              isPending={editMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      )}
    </main>
  );
};