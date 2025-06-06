
import { Venue } from '@/types/venue';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle,
  AlertDialogOverlay
} from '@/components/ui/alert-dialog';

interface AdminVenueDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  venue: Venue | null;
  onConfirm: () => void;
  isDeleting: boolean;
}

export const AdminVenueDeleteDialog = ({
  open,
  onOpenChange,
  venue,
  onConfirm,
  isDeleting
}: AdminVenueDeleteDialogProps) => {
  return (
    <AlertDialog 
      open={open} 
      onOpenChange={(newOpenState) => {
        console.log('AlertDialog onOpenChange:', newOpenState);
        onOpenChange(newOpenState);
        
        // Ensure body is interactive when closing alert dialog
        if (!newOpenState) {
          document.body.style.pointerEvents = '';
          document.body.style.overflow = '';
        }
      }}
    >
      <AlertDialogOverlay className="z-[260]" />
      <AlertDialogContent 
        className="z-[270]"
        onCloseAutoFocus={(event) => {
          // Prevent the default focus behavior to avoid potential issues
          event.preventDefault();
          
          // Force document.body to be interactive again
          document.body.style.pointerEvents = '';
          document.body.style.overflow = '';
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Venue</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete {venue?.name}? This action cannot be undone.
            All venue data including hours, specials, and check-ins will be deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Venue'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
