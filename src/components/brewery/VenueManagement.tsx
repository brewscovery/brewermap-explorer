import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useBreweryVenues } from '@/hooks/useBreweryVenues';
import VenueList from './venue/VenueList';
import type { Venue } from '@/types/venue';
import DeleteVenueDialog from './venue/DeleteVenueDialog';
import VenueHoursDialog from './VenueHoursDialog';
import EditVenueDialog from './EditVenueDialog';
import VenueEventsManager from './venue/VenueEventsManager';

interface VenueManagementProps {
  breweryId: string;
}

const VenueManagement = ({ breweryId }: VenueManagementProps) => {
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showHoursDialog, setShowHoursDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  
  const { 
    venues, 
    isLoading, 
    deleteVenue, 
    isDeleting 
  } = useBreweryVenues(breweryId);

  const handleAddVenue = () => {
    navigate('/dashboard/venues?action=add');
  };
  
  const handleEditVenue = (venue: Venue) => {
    setSelectedVenue(venue);
    setShowEditDialog(true);
  };
  
  const handleEditHours = (venue: Venue) => {
    setSelectedVenue(venue);
    setShowHoursDialog(true);
  };
  
  const handleDeleteVenue = (venue: Venue) => {
    setSelectedVenue(venue);
    setShowDeleteDialog(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!selectedVenue) return;
    
    try {
      await deleteVenue(selectedVenue.id);
      toast.success(`Venue "${selectedVenue.name}" deleted successfully`);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting venue:', error);
      toast.error('Failed to delete venue');
    }
  };
  
  const handleSelectVenue = (venue: Venue) => {
    navigate(`/dashboard/venues?venueId=${venue.id}`);
  };

  return (
    <div>
      <VenueList 
        venues={venues}
        isLoading={isLoading}
        onEditVenue={handleEditVenue}
        onEditHours={handleEditHours}
        onDeleteVenue={handleDeleteVenue}
        onAddVenue={handleAddVenue}
        onSelectVenue={handleSelectVenue}
      />
      {selectedVenue && (
        <div className="mt-6">
          <VenueEventsManager venue={selectedVenue} />
        </div>
      )}
      {selectedVenue && (
        <>
          <DeleteVenueDialog 
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            venue={selectedVenue}
            onConfirm={handleDeleteConfirm}
            isDeleting={isDeleting}
          />
          <VenueHoursDialog
            open={showHoursDialog}
            onOpenChange={setShowHoursDialog}
            venue={selectedVenue}
          />
          <EditVenueDialog
            open={showEditDialog}
            onOpenChange={setShowEditDialog}
            venue={selectedVenue}
            isUpdating={false}
            onVenueUpdated={async () => {
              setShowEditDialog(false);
              return true;
            }}
          />
        </>
      )}
    </div>
  );
};

export default VenueManagement;
