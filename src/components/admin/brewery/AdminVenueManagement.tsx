
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog-fixed'; // Use fixed dialog
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useBreweryVenues, useCreateVenue, useDeleteVenue } from '@/hooks/useAdminBreweries';
import { VenueForm } from '@/components/brewery/venue-form/VenueForm';
import { useVenueForm } from '@/hooks/useVenueForm';
import type { Venue } from '@/types/venue';
import { VenueList } from './AdminVenueList';

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
  // Only fetch venues when dialog is open and breweryId is valid
  const validBreweryId = open && breweryId ? breweryId : null;
  const { data: venues, isLoading, refetch } = useBreweryVenues(validBreweryId);
  const createVenue = useCreateVenue();
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
  
  // Reset dialog state when opened/closed
  useEffect(() => {
    if (!open) {
      setIsAddingVenue(false);
      setDeleteConfirmOpen(false);
      setVenueToDelete(null);
      resetForm();
      
      // Explicitly reset body styles when closing
      document.body.style.pointerEvents = '';
      document.body.style.overflow = '';
    }
  }, [open, resetForm]);
  
  const handleAddVenue = () => {
    resetForm();
    setIsAddingVenue(true);
  };
  
  const handleDeleteVenue = (venue: Venue) => {
    setVenueToDelete(venue);
    setDeleteConfirmOpen(true);
  };
  
  const confirmDeleteVenue = async () => {
    if (!venueToDelete) return;
    
    try {
      await deleteVenue.mutateAsync(venueToDelete.id);
      refetch();
      setDeleteConfirmOpen(false);
      setVenueToDelete(null);
    } catch (error) {
      console.error('Error deleting venue:', error);
    }
  };
  
  const handleVenueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsFormLoading(true);
      
      // Get coordinates if missing
      const coordinates = await getCoordinates();
      
      // Combine all data
      const venueData = {
        ...formData,
        brewery_id: breweryId,
        longitude: coordinates.longitude,
        latitude: coordinates.latitude
      };
      
      await createVenue.mutateAsync(venueData);
      
      // Close the form and refetch venues
      setIsAddingVenue(false);
      refetch();
      resetForm();
    } catch (error) {
      console.error('Error creating venue:', error);
    } finally {
      setIsFormLoading(false);
    }
  };

  // Handle closing of the add venue dialog
  const handleAddVenueDialogOpenChange = (open: boolean) => {
    setIsAddingVenue(open);
    if (!open) {
      resetForm();
      
      // Make sure body is interactive after inner dialog closes
      document.body.style.pointerEvents = '';
      document.body.style.overflow = '';
    }
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(newOpenState) => {
        // Extra cleanup when closing
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
                       
                       // Force document.body to be interactive again
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
          
          {/* Only render inner dialogs when they're open */}
          {isAddingVenue && (
            <Dialog open={isAddingVenue} onOpenChange={handleAddVenueDialogOpenChange}>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Add New Venue</DialogTitle>
                  <DialogDescription>
                    Create a new venue for {breweryName}
                  </DialogDescription>
                </DialogHeader>
                
                <VenueForm
                  formData={formData}
                  addressInput={addressInput}
                  isSubmitting={isFormLoading || createVenue.isPending}
                  submitLabel="Create Venue"
                  handleSubmit={handleVenueSubmit}
                  handleChange={handleChange}
                  handleAddressChange={handleAddressChange}
                  setAddressInput={setAddressInput}
                  onCancel={() => {
                    setIsAddingVenue(false);
                    
                    // Ensure body is interactive when canceling
                    document.body.style.pointerEvents = '';
                    document.body.style.overflow = '';
                  }}
                />
              </DialogContent>
            </Dialog>
          )}
          
          {deleteConfirmOpen && venueToDelete && (
            <AlertDialog 
              open={deleteConfirmOpen} 
              onOpenChange={(newOpenState) => {
                setDeleteConfirmOpen(newOpenState);
                
                // Ensure body is interactive when closing alert dialog
                if (!newOpenState) {
                  document.body.style.pointerEvents = '';
                  document.body.style.overflow = '';
                }
              }}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Venue</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete {venueToDelete.name}? This action cannot be undone.
                    All venue data including hours, specials, and check-ins will be deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={confirmDeleteVenue}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleteVenue.isPending ? 'Deleting...' : 'Delete Venue'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminVenueManagement;
