
import React from 'react';
import { IncidentItem } from '@/services/incident/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { IncidentDetailHeader } from './IncidentDetailHeader';
import { Separator } from '@/components/ui/separator';
import { 
  BasicInfoSection, 
  TimelineSection, 
  AffectedSystemsSection,
  ResolutionSection
} from './sections';
import { IncidentDetailFooter } from './IncidentDetailFooter';
import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/userService';

interface IncidentDetailContentProps {
  incident: IncidentItem;
  onClose: () => void;
  assignedUser: any | null;
}

export const IncidentDetailContent = ({ 
  incident, 
  onClose, 
  assignedUser 
}: IncidentDetailContentProps) => {
  // Fetch assigned user details if none was provided; prefer server field
  const assigneeId = incident?.assigned_users || incident?.assigned_to;
  const { data: fetchedUser } = useQuery({
    queryKey: ['user', assigneeId],
    queryFn: async () => {
      if (!assigneeId) return null;
      try {
        return await userService.getUser(assigneeId);
      } catch (error) {
        console.error("Failed to fetch assigned user:", error);
        return null;
      }
    },
    enabled: !!assigneeId && !assignedUser,
    staleTime: 300000 // Cache for 5 minutes
  });

  // Use the provided assignedUser or the one we fetched
  const userToDisplay = assignedUser || fetchedUser;

  return (
    <ScrollArea className="h-[80vh] print:h-auto print:overflow-visible">
      <div className="px-6 py-6">
        <div className="print-section header-print">
          <IncidentDetailHeader incident={incident} />
        </div>

        <div className="space-y-8 print-compact-spacing">
          <div className="print-section">
            <BasicInfoSection incident={incident} assignedUser={userToDisplay} />
          </div>
          <Separator className="print:border-blue-200" />
          <div className="print-section">
            <TimelineSection incident={incident} assignedUser={userToDisplay} />
          </div>
          <Separator className="print:border-blue-200" />
          <div className="print-section">
            <AffectedSystemsSection incident={incident} assignedUser={userToDisplay} />
          </div>
          <Separator className="print:border-blue-200" />
          <div className="print-section">
            <ResolutionSection incident={incident} assignedUser={userToDisplay} />
          </div>

          <IncidentDetailFooter onClose={onClose} incident={incident} />
        </div>
      </div>
    </ScrollArea>
  );
};
