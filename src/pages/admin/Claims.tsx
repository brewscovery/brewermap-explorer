
import React, { useState } from 'react';
import { BreweryClaim } from '@/types/admin';
import { useBreweryClaims, useBreweryClaimUpdate } from '@/hooks/useAdminData';
import { ClaimsTable } from '@/components/admin/claims/ClaimsTable';
import { ClaimDetailsDialog } from '@/components/admin/claims/ClaimDetailsDialog';
import { ClaimDecisionDialog } from '@/components/admin/claims/ClaimDecisionDialog';

const ClaimsManagement = () => {
  const { data: claims, isLoading, error } = useBreweryClaims();
  const [selectedClaim, setSelectedClaim] = useState<BreweryClaim | null>(null);
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [isDecisionDialogOpen, setIsDecisionDialogOpen] = useState<boolean>(false);
  const [pendingDecision, setPendingDecision] = useState<'approved' | 'rejected' | null>(null);
  
  const updateClaimMutation = useBreweryClaimUpdate();

  const handleOpenDetail = (claim: BreweryClaim) => {
    setSelectedClaim(claim);
    setAdminNotes(claim.admin_notes || '');
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedClaim(null);
  };

  const handleOpenDecisionDialog = (claim: BreweryClaim, decision: 'approved' | 'rejected') => {
    setSelectedClaim(claim);
    setAdminNotes(claim.admin_notes || '');
    setPendingDecision(decision);
    setIsDecisionDialogOpen(true);
  };

  const handleSaveNotes = async () => {
    if (!selectedClaim) return;
    
    try {
      await updateClaimMutation.mutateAsync({
        claimId: selectedClaim.id,
        status: selectedClaim.status,
        adminNotes: adminNotes
      });
      setIsDetailOpen(false);
    } catch (error) {
      // Error handling is managed by the mutation
    }
  };

  const handleMakeDecision = async () => {
    if (!selectedClaim || !pendingDecision) return;
    
    try {
      await updateClaimMutation.mutateAsync({
        claimId: selectedClaim.id,
        status: pendingDecision,
        adminNotes: adminNotes
      });
      
      setIsDecisionDialogOpen(false);
      setPendingDecision(null);
    } catch (error) {
      // Error handling is managed by the mutation
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Brewery Claims Management</h1>
        </div>
        <div className="p-4 border rounded-md bg-red-50 text-red-800">
          Error loading claims: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Brewery Claims Management</h1>
      </div>
      
      <div className="rounded-md border">
        <ClaimsTable
          claims={claims}
          isLoading={isLoading}
          onViewDetails={handleOpenDetail}
          onApprove={(claim) => handleOpenDecisionDialog(claim, 'approved')}
          onReject={(claim) => handleOpenDecisionDialog(claim, 'rejected')}
        />
      </div>

      <ClaimDetailsDialog
        claim={selectedClaim}
        isOpen={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        adminNotes={adminNotes}
        onAdminNotesChange={setAdminNotes}
        onSaveNotes={handleSaveNotes}
      />

      <ClaimDecisionDialog
        claim={selectedClaim}
        isOpen={isDecisionDialogOpen}
        onOpenChange={setIsDecisionDialogOpen}
        adminNotes={adminNotes}
        onAdminNotesChange={setAdminNotes}
        onMakeDecision={handleMakeDecision}
        pendingDecision={pendingDecision}
        isProcessing={updateClaimMutation.isPending}
      />
    </div>
  );
};

export default ClaimsManagement;
