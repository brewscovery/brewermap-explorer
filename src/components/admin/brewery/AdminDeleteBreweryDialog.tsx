
import { useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useDeleteBrewery } from '@/hooks/useAdminBreweries';

interface DeleteBreweryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  breweryId: string | null;
  breweryName: string;
}

const DeleteBreweryDialog = ({
  open,
  onOpenChange,
  breweryId,
  breweryName,
}: DeleteBreweryDialogProps) => {
  const deleteBrewery = useDeleteBrewery();
  
  // Reset state when dialog is closed
  useEffect(() => {
    if (!open) {
      // Clean up any local state if needed
    }
  }, [open]);

  const handleDelete = async () => {
    if (!breweryId) return;
    
    try {
      await deleteBrewery.mutateAsync(breweryId);
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting brewery:', error);
    }
  };

  // Only enable the delete button if we have a valid breweryId
  const hasValidBreweryId = !!breweryId && breweryId.length > 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Brewery</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{breweryName}</strong>? This action cannot be undone.
            <br />
            <br />
            This will also delete:
            <ul className="list-disc ml-6 mt-2">
              <li>All venues associated with this brewery</li>
              <li>All hours, specials, and other venue data</li>
              <li>All brewery owner relationships</li>
            </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={deleteBrewery.isPending || !hasValidBreweryId}
          >
            {deleteBrewery.isPending ? 'Deleting...' : 'Delete Brewery'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteBreweryDialog;
