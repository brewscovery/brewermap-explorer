
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog-fixed'; // Use fixed dialog
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useBreweryVenues, useCreateVenue, useDeleteVenue } from '@/hooks/useAdminBreweries';
import { VenueForm } from '@/components/brewery/venue-form/VenueForm';
import { useVenueForm } from '@/hooks/useVenueForm';
import type { Venue } from '@/types/venue';
import { VenueList } from './AdminVenueList';
import { logFocusState, logDialogElements } from '@/utils/debugUtils';

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
  // DEBUG LOGGING for component lifecycle
  useEffect(() => {
    console.log('DEBUG: AdminVenueManagement mounted for brewery:', breweryId, breweryName);
    return () => {
      console.log('DEBUG: AdminVenueManagement unmounted - was for brewery:', breweryId, breweryName);
      
      // Extra cleanup on unmount
      if (open) {
        console.log('DEBUG: Venue Management Dialog was still open during unmount - forcing cleanup');
        document.body.style.pointerEvents = '';
        document.body.style.overflow = '';
        
        // Run additional checks
        setTimeout(() => {
          logFocusState();
          logDialogElements();
        }, 100);
      }
    };
  }, []);
  
  // DEBUG LOGGING for dialog open state
  useEffect(() => {
    console.log('DEBUG: AdminVenueManagement open state changed to:', open, 'for brewery:', breweryId);
    
    // Add an extra check for DOM elements after state change
    setTimeout(() => {
      logDialogElements();
      logFocusState();
    }, 100);
  }, [open, breweryId]);
  
  // Only fetch venues when dialog is open and breweryId is valid
  const validBreweryId = open && breweryId ? breweryId : null;
  const { venues, isLoading, refetch } = useBreweryVenues(validBreweryId);
  const createVenue = useCreateVenue();
  const deleteVenue = useDeleteVenue();
  
  const [isAddingVenue, setIsAddingVenue] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [venueToDelete, setVenueToDelete] = useState<Venue | null>(null);
  
  // DEBUG LOGGING for inner dialog states
  useEffect(() => {
    console.log('DEBUG: Inner dialog states:', {
      isAddingVenue,
      deleteConfirmOpen,
      hasVenueToDelete: !!venueToDelete,
      venueToDeleteId: venueToDelete?.id
    });
  }, [isAddingVenue, deleteConfirmOpen, venueToDelete]);
  
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
    console.log('DEBUG: AdminVenueManagement - open state effect triggered:', open);
    if (!open) {
      console.log('DEBUG: AdminVenueManagement - dialog closed, resetting inner state');
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
    console.log('DEBUG: handleAddVenue called');
    resetForm();
    setIsAddingVenue(true);
  };
  
  const handleDeleteVenue = (venue: Venue) => {
    console.log('DEBUG: handleDeleteVenue called for venue:', venue.id, venue.name);
    setVenueToDelete(venue);
    setDeleteConfirmOpen(true);
  };
  
  const confirmDeleteVenue = async () => {
    if (!venueToDelete) return;
    
    console.log('DEBUG: confirmDeleteVenue called for venue:', venueToDelete.id);
    try {
      await deleteVenue.mutateAsync(venueToDelete.id);
      console.log('DEBUG: Venue deleted successfully');
      refetch();
      setDeleteConfirmOpen(false);
      setVenueToDelete(null);
    } catch (error) {
      console.error('DEBUG: Error deleting venue:', error);
    }
  };
  
  const handleVenueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('DEBUG: handleVenueSubmit called');
    
    if (!validateForm()) {
      console.log('DEBUG: Form validation failed');
      return;
    }
    
    try {
      setIsFormLoading(true);
      console.log('DEBUG: Getting coordinates for venue');
      
      // Get coordinates if missing
      const coordinates = await getCoordinates();
      
      // Combine all data
      const venueData = {
        ...formData,
        brewery_id: breweryId,
        longitude: coordinates.longitude,
        latitude: coordinates.latitude
      };
      
      console.log('DEBUG: Creating venue with data:', venueData);
      await createVenue.mutateAsync(venueData);
      
      console.log('DEBUG: Venue created successfully');
      // Close the form and refetch venues
      setIsAddingVenue(false);
      refetch();
      resetForm();
    } catch (error) {
      console.error('DEBUG: Error creating venue:', error);
    } finally {
      setIsFormLoading(false);
    }
  };

  // Handle closing of the add venue dialog
  const handleAddVenueDialogOpenChange = (open: boolean) => {
    console.log('DEBUG: handleAddVenueDialogOpenChange called with open:', open);
    setIsAddingVenue(open);
    if (!open) {
      console.log('DEBUG: Add venue dialog closed, resetting form');
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
        console.log('DEBUG: Venue Management Dialog onOpenChange called with new state:', newOpenState, 'for brewery:', breweryId);
        
        // Extra cleanup when closing
        if (!newOpenState) {
          console.log('DEBUG: Ensuring body is interactive on venue management dialog close');
          document.body.style.pointerEvents = '';
          document.body.style.overflow = '';
          
          // Double-check dialog elements are properly removed
          setTimeout(logDialogElements, 100);
        }
        
        onOpenChange(newOpenState);
      }}
    >
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto" 
                     onEscapeKeyDown={() => {
                       console.log('DEBUG: Escape key pressed in venue management dialog content');
                     }}
                     onCloseAutoFocus={(event) => {
                       console.log('DEBUG: Venue Management Dialog onCloseAutoFocus triggered');
                       event.preventDefault();
                       
                       // Force document.body to be interactive again
                       document.body.style.pointerEvents = '';
                       document.body.style.overflow = '';
                       
                       // Log the focus state after closing
                       setTimeout(logFocusState, 50);
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
            venues={venues}
            isLoading={isLoading}
            onDeleteVenue={handleDeleteVenue}
          />
          
          {/* Only render inner dialogs when they're open */}
          {isAddingVenue && (
            <>
              {console.log('DEBUG: Rendering add venue dialog')}
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
                      console.log('DEBUG: Add venue form cancel button clicked');
                      setIsAddingVenue(false);
                      
                      // Ensure body is interactive when canceling
                      document.body.style.pointerEvents = '';
                      document.body.style.overflow = '';
                    }}
                  />
                </DialogContent>
              </Dialog>
            </>
          )}
          
          {deleteConfirmOpen && venueToDelete && (
            <>
              {console.log('DEBUG: Rendering delete venue confirmation dialog for venue:', venueToDelete.id)}
              <AlertDialog 
                open={deleteConfirmOpen} 
                onOpenChange={(newOpenState) => {
                  console.log('DEBUG: Delete venue confirm dialog onOpenChange called with new state:', newOpenState);
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
                    <AlertDialogCancel onClick={() => {
                      console.log('DEBUG: Delete venue cancel button clicked');
                    }}>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => {
                        console.log('DEBUG: Delete venue confirm button clicked');
                        confirmDeleteVenue();
                      }}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {deleteVenue.isPending ? 'Deleting...' : 'Delete Venue'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminVenueManagement;
