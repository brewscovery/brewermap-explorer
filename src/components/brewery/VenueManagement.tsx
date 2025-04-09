
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useBreweryVenues } from '@/hooks/useBreweryVenues';
import type { Venue } from '@/types/venue';
import AddVenueDialog from './AddVenueDialog';
import EditVenueDialog from './EditVenueDialog';
import VenueHoursDialog from './VenueHoursDialog';
import DeleteVenueDialog from './venue/DeleteVenueDialog';
import VenueList from './venue/VenueList';

interface VenueManagementProps {
  breweryId: string | null;
}

const VenueManagement = ({ breweryId }: VenueManagementProps) => {
  const [showAddVenueDialog, setShowAddVenueDialog] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [deletingVenue, setDeletingVenue] = useState<Venue | null>(null);
  const [hoursVenue, setHoursVenue] = useState<Venue | null>(null);
  const { venues, isLoading, refetch, updateVenue, deleteVenue, isUpdating, isDeleting } = useBreweryVenues(breweryId);
  
  const handleVenueAdded = () => {
    refetch();
  };
  
  const handleEditVenue = (venue: Venue) => {
    setEditingVenue(venue);
  };
  
  const handleDeleteVenue = (venue: Venue) => {
    setDeletingVenue(venue);
  };
  
  const handleEditHours = (venue: Venue) => {
    setHoursVenue(venue);
  };
  
  const confirmDeleteVenue = async () => {
    if (!deletingVenue) return;
    
    const success = await deleteVenue(deletingVenue.id);
    if (success) {
      setDeletingVenue(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold">Your Venues</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Manage the locations where customers can find your products
          </p>
        </div>
        <Button onClick={() => setShowAddVenueDialog(true)}>
          <Plus className="mr-2" size={18} />
          Add Venue
        </Button>
      </div>
      
      <VenueList 
        venues={venues}
        isLoading={isLoading}
        onEditVenue={handleEditVenue}
        onEditHours={handleEditHours}
        onDeleteVenue={handleDeleteVenue}
        onAddVenue={() => setShowAddVenueDialog(true)}
      />
      
      <DeleteVenueDialog 
        venue={deletingVenue}
        isDeleting={isDeleting}
        onClose={() => setDeletingVenue(null)}
        onConfirm={confirmDeleteVenue}
      />
      
      {breweryId && (
        <>
          <AddVenueDialog
            open={showAddVenueDialog}
            onOpenChange={(open) => {
              setShowAddVenueDialog(open);
              // Make sure body is interactive when closing
              if (!open) {
                document.body.style.pointerEvents = '';
                document.body.style.overflow = '';
              }
            }}
            breweryId={breweryId}
            onVenueAdded={handleVenueAdded}
          />
          
          <EditVenueDialog
            open={!!editingVenue}
            onOpenChange={(open) => {
              if (!open) {
                setEditingVenue(null);
                // Make sure body is interactive when closing
                document.body.style.pointerEvents = '';
                document.body.style.overflow = '';
              }
            }}
            venue={editingVenue}
            onVenueUpdated={updateVenue}
            isUpdating={isUpdating}
          />

          <VenueHoursDialog
            open={!!hoursVenue}
            onOpenChange={(open) => {
              if (!open) {
                setHoursVenue(null);
                // Make sure body is interactive when closing
                document.body.style.pointerEvents = '';
                document.body.style.overflow = '';
              }
            }}
            venue={hoursVenue}
          />
        </>
      )}
    </div>
  );
};

export default VenueManagement;
