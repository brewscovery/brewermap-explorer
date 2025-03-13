
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Venue } from '@/types/venue';

interface DeleteVenueDialogProps {
  venue: Venue | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteVenueDialog = ({ venue, isDeleting, onClose, onConfirm }: DeleteVenueDialogProps) => {
  if (!venue) return null;
  
  return (
    <Dialog open={!!venue} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the venue "{venue.name}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Venue'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteVenueDialog;
