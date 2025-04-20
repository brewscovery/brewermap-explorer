
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog-fixed';
import { Button } from '@/components/ui/button';
import { useBreweryVenues, useCreateVenue, useDeleteVenue } from '@/hooks/useAdminBreweries';
import { useVenueForm } from '@/hooks/useVenueForm';
import type { Venue } from '@/types/venue';
import { VenueList } from './AdminVenueList';
import { toast } from 'sonner';
import { AdminVenueAddDialog } from './AdminVenueAddDialog';
import { AdminVenueDeleteDialog } from './AdminVenueDeleteDialog';

interface AdminVenueManagementProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  breweryId: string;
  breweryName: string;
}

const AdminVenueManagement = ({ 
  open, 
  onOpenChange, 
  breweryId,
  breweryName 
}: AdminVenueManagementProps) => {
  const validBreweryId = open && breweryId ? breweryId : null;
  const { venues, isLoading, refetch } = useBreweryVenues(validBreweryId);
  const { createVenue, isLoading: isCreateLoading, isPending } = useCreateVenue();
  const deleteVenue = useDeleteVenue();
  
  const [isAddingVenue, setIsAddingVenue] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [venueToDelete, setVenueToDelete] = useState<Venue | null>(null);
  
  const {
    formData,
    addressInput,
    setAddressInput,
    isLoading: isFormLoading,
    setIsLoading: setIsFormLoading,
    handleChange,
    handleAddressChange,
    validateForm,
    getCoordinates,
    resetForm
  } = useVenueForm({
    initialData: {
      brewery_id: breweryId
    },
    resetOnSuccess: true
  });
  
  useEffect(() => {
    if (!open) {
      resetDialogState();
    }
  }, [open]);
  
  const resetDialogState = () => {
    setIsAddingVenue(false);
    setDeleteConfirmOpen(false);
    setVenueToDelete(null);
    resetForm();
    
    document.body.style.pointerEvents = '';
    document.body.style.overflow = '';
  };
  
  const handleAddVenue = () => {
    resetForm();
    setIsAddingVenue(true);
  };
  
  const handleDeleteVenue = (venue: Venue) => {
    console.log('Delete venue triggered for:', venue.name);
    setVenueToDelete(venue);
    setDeleteConfirmOpen(true);
  };
  
  const confirmDeleteVenue = async () => {
    if (!venueToDelete) return;
    
    try {
      if (deleteVenue.mutateAsync) {
        await deleteVenue.mutateAsync(venueToDelete.id);
      } else {
        await deleteVenue.deleteVenue(venueToDelete.id);
      }
      refetch();
      setDeleteConfirmOpen(false);
      setVenueToDelete(null);
      toast.success(`Venue "${venueToDelete.name}" deleted successfully`);
    } catch (error) {
      console.error('Error deleting venue:', error);
      toast.error('Failed to delete venue');
    }
  };
  
  const handleVenueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsFormLoading(true);
      
      const coordinates = await getCoordinates();
      
      if (!formData.name || !formData.city || !formData.state) {
        toast.error('Name, city, and state are required');
        setIsFormLoading(false);
        return;
      }
      
      const venueData = {
        ...formData,
        brewery_id: breweryId,
        longitude: coordinates.longitude,
        latitude: coordinates.latitude
      };
      
      await createVenue(venueData);
      
      setIsAddingVenue(false);
      refetch();
      resetForm();
    } catch (error) {
      console.error('Error creating venue:', error);
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleAddVenueDialogOpenChange = (open: boolean) => {
    setIsAddingVenue(open);
    if (!open) {
      resetForm();
      
      document.body.style.pointerEvents = '';
      document.body.style.overflow = '';
    }
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(newOpenState) => {
        if (!newOpenState) {
          document.body.style.pointerEvents = '';
          document.body.style.overflow = '';
        }
        
        onOpenChange(newOpenState);
      }}
    >
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto"
                     onEscapeKeyDown={() => {}}
                     onCloseAutoFocus={(event) => {
                       event.preventDefault();
                       
                       document.body.style.pointerEvents = '';
                       document.body.style.overflow = '';
                     }}>
        <DialogHeader>
          <DialogTitle>Manage Venues for {breweryName}</DialogTitle>
          <DialogDescription>
            Add, edit or delete venues for this brewery.
          </DialogDescription>
        </DialogHeader>
        
        <div className="pt-4 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Venues</h3>
            <Button onClick={handleAddVenue}>Add New Venue</Button>
          </div>
          
          <VenueList 
            venues={venues || []}
            isLoading={isLoading}
            onDeleteVenue={handleDeleteVenue}
          />
          
          {isAddingVenue && (
            <AdminVenueAddDialog
              open={isAddingVenue}
              onOpenChange={handleAddVenueDialogOpenChange}
              breweryName={breweryName}
              formData={formData}
              addressInput={addressInput}
              isFormLoading={isFormLoading}
              setAddressInput={setAddressInput}
              handleChange={handleChange}
              handleAddressChange={handleAddressChange}
              handleVenueSubmit={handleVenueSubmit}
              isPending={isPending}
            />
          )}
          
          <AdminVenueDeleteDialog
            open={deleteConfirmOpen}
            onOpenChange={setDeleteConfirmOpen}
            venue={venueToDelete}
            onConfirm={confirmDeleteVenue}
            isDeleting={deleteVenue.isPending || false}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminVenueManagement;
