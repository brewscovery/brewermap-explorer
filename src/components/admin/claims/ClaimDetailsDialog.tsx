
import React from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { BreweryClaim } from '@/types/admin';
import { ClaimStatusBadge } from './ClaimStatusBadge';

interface ClaimDetailsDialogProps {
  claim: BreweryClaim | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  adminNotes: string;
  onAdminNotesChange: (notes: string) => void;
  onSaveNotes: () => void;
}

export const ClaimDetailsDialog = ({
  claim,
  isOpen,
  onOpenChange,
  adminNotes,
  onAdminNotesChange,
  onSaveNotes
}: ClaimDetailsDialogProps) => {
  if (!claim) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Claim Details</DialogTitle>
          <DialogDescription>
            Viewing details for brewery claim
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-sm">Brewery</h3>
              <p>{claim.brewery_name || 'Unknown Brewery'}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm">Status</h3>
              <div className="mt-1">
                <ClaimStatusBadge status={claim.status} />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-sm">Claimed By</h3>
              <p>{claim.user_name || 'Unknown User'}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm">Submitted On</h3>
              <p>{format(new Date(claim.created_at), 'PPpp')}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm">Contact Email</h3>
              <p>{claim.contact_email || 'Not provided'}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm">Contact Phone</h3>
              <p>{claim.contact_phone || 'Not provided'}</p>
            </div>
            
            {claim.decision_at && (
              <div className="col-span-2">
                <h3 className="font-semibold text-sm">Decision Date</h3>
                <p>{format(new Date(claim.decision_at), 'PPpp')}</p>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Admin Notes</h3>
            <Textarea 
              value={adminNotes} 
              onChange={(e) => onAdminNotesChange(e.target.value)}
              placeholder="Add notes about this claim..."
              rows={4}
            />
          </div>
        </div>
        
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button 
            onClick={onSaveNotes}
            disabled={claim.admin_notes === adminNotes}
          >
            Save Notes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
