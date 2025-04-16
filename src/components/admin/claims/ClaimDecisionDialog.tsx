
import React from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { BreweryClaim } from '@/types/admin';

interface ClaimDecisionDialogProps {
  claim: BreweryClaim | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  adminNotes: string;
  onAdminNotesChange: (notes: string) => void;
  onMakeDecision: () => void;
  pendingDecision: 'approved' | 'rejected' | null;
  isProcessing: boolean;
}

export const ClaimDecisionDialog = ({
  claim,
  isOpen,
  onOpenChange,
  adminNotes,
  onAdminNotesChange,
  onMakeDecision,
  pendingDecision,
  isProcessing
}: ClaimDecisionDialogProps) => {
  if (!claim || !pendingDecision) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {pendingDecision === 'approved' 
              ? 'Approve Brewery Claim' 
              : 'Reject Brewery Claim'}
          </DialogTitle>
          <DialogDescription>
            {pendingDecision === 'approved'
              ? 'This will grant the user ownership of the brewery.'
              : 'This will deny the user\'s claim to the brewery.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <p><span className="font-medium">Brewery:</span> {claim.brewery_name}</p>
            <p><span className="font-medium">Claimed by:</span> {claim.user_name}</p>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Admin Notes</h3>
            <Textarea 
              value={adminNotes} 
              onChange={(e) => onAdminNotesChange(e.target.value)}
              placeholder="Add notes about this decision..."
              rows={4}
            />
          </div>
        </div>
        
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button 
            onClick={onMakeDecision}
            variant={pendingDecision === 'approved' ? 'default' : 'destructive'}
            disabled={isProcessing}
          >
            {isProcessing 
              ? 'Processing...' 
              : pendingDecision === 'approved' 
                ? 'Approve Claim' 
                : 'Reject Claim'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
