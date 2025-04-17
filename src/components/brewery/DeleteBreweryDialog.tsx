
import { useEffect, useState } from 'react';
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
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface DeleteBreweryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  breweryId: string | null;
  breweryName: string;
  onSuccess?: () => void;
}

const DeleteBreweryDialog = ({
  open,
  onOpenChange,
  breweryId,
  breweryName,
  onSuccess
}: DeleteBreweryDialogProps) => {
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Reset state when dialog is closed
  useEffect(() => {
    if (!open) {
      setIsDeleting(false);
    }
  }, [open]);

  const handleDelete = async () => {
    if (!breweryId) return;
    
    try {
      setIsDeleting(true);
      
      // First, delete all venues associated with this brewery
      const { data: venues, error: venuesError } = await supabase
        .from('venues')
        .select('id')
        .eq('brewery_id', breweryId);
      
      if (venuesError) throw venuesError;
      
      // Delete all venues if they exist
      if (venues && venues.length > 0) {
        // Delete venues one by one to ensure proper cleanup of related data
        for (const venue of venues) {
          // Delete venue hours
          const { error: hoursError } = await supabase
            .from('venue_hours')
            .delete()
            .eq('venue_id', venue.id);
          
          if (hoursError) throw hoursError;
          
          // Delete venue happy hours
          const { error: happyHoursError } = await supabase
            .from('venue_happy_hours')
            .delete()
            .eq('venue_id', venue.id);
          
          if (happyHoursError) throw happyHoursError;
          
          // Delete venue daily specials
          const { error: specialsError } = await supabase
            .from('venue_daily_specials')
            .delete()
            .eq('venue_id', venue.id);
          
          if (specialsError) throw specialsError;
          
          // Delete check-ins for this venue
          const { error: checkinsError } = await supabase
            .from('checkins')
            .delete()
            .eq('venue_id', venue.id);
          
          if (checkinsError) throw checkinsError;
        }
        
        // Delete all venues for this brewery
        const { error: deleteVenuesError } = await supabase
          .from('venues')
          .delete()
          .eq('brewery_id', breweryId);
        
        if (deleteVenuesError) throw deleteVenuesError;
      }
      
      // Delete brewery owners
      const { error: ownersError } = await supabase
        .from('brewery_owners')
        .delete()
        .eq('brewery_id', breweryId);
      
      if (ownersError) throw ownersError;
      
      // Delete the brewery itself
      const { error: breweryError } = await supabase
        .from('breweries')
        .delete()
        .eq('id', breweryId);
      
      if (breweryError) throw breweryError;
      
      // Success
      toast.success('Brewery deleted successfully');
      onOpenChange(false);
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['breweries'] });
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error deleting brewery:', error);
      toast.error(`Failed to delete brewery: ${error.message}`);
    } finally {
      setIsDeleting(false);
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
            disabled={isDeleting || !hasValidBreweryId}
          >
            {isDeleting ? 'Deleting...' : 'Delete Brewery'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteBreweryDialog;
