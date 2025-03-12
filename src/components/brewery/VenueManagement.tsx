
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  MapPin, 
  Trash2, 
  Phone, 
  Globe, 
  Edit, 
  Building, 
  ChevronRight 
} from 'lucide-react';
import { useBreweryVenues } from '@/hooks/useBreweryVenues';
import { toast } from 'sonner';
import AddVenueDialog from './AddVenueDialog';
import EditVenueDialog from './EditVenueDialog';
import type { Venue } from '@/types/venue';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface VenueManagementProps {
  breweryId: string | null;
}

const VenueManagement = ({ breweryId }: VenueManagementProps) => {
  const [showAddVenueDialog, setShowAddVenueDialog] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [deletingVenue, setDeletingVenue] = useState<Venue | null>(null);
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
  
  const confirmDeleteVenue = async () => {
    if (!deletingVenue) return;
    
    const success = await deleteVenue(deletingVenue.id);
    if (success) {
      setDeletingVenue(null);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
        <MapPin className="animate-pulse h-10 w-10 mb-2 opacity-50" />
        <p>Loading venues...</p>
      </div>
    );
  }

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
      
      {venues.length === 0 ? (
        <Card className="border-dashed bg-muted/40">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <MapPin className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
              <h3 className="text-lg font-medium">No venues found</h3>
              <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                Add your first venue to help customers find your brewery locations. Each venue will appear on the map.
              </p>
              <Button 
                onClick={() => setShowAddVenueDialog(true)} 
                className="mt-6"
                variant="outline"
              >
                <Plus className="mr-2" size={16} />
                Add Your First Venue
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {venues.map((venue) => (
            <Card key={venue.id} className="overflow-hidden transition-all hover:shadow-md">
              <CardHeader className="pb-2 border-b bg-muted/20">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl line-clamp-1">{venue.name}</CardTitle>
                  {venue.latitude && venue.longitude ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Mapped
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      Unmapped
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Building className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-muted-foreground">
                      {venue.street && <p>{venue.street}</p>}
                      <p>{venue.city}, {venue.state} {venue.postal_code || ''}</p>
                    </div>
                  </div>
                  
                  {venue.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm">{venue.phone}</span>
                    </div>
                  )}
                  
                  {venue.website_url && (
                    <div className="flex items-center gap-3">
                      <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <a 
                        href={venue.website_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-500 hover:text-blue-700 hover:underline truncate max-w-[200px]"
                      >
                        {venue.website_url.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                  
                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditVenue(venue)}
                      className="flex-1"
                    >
                      <Edit className="mr-1" size={14} />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleDeleteVenue(venue)}
                    >
                      <Trash2 className="mr-1" size={14} />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingVenue} onOpenChange={(open) => !open && setDeletingVenue(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the venue "{deletingVenue?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeletingVenue(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteVenue}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Venue'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {breweryId && (
        <>
          <AddVenueDialog
            open={showAddVenueDialog}
            onOpenChange={setShowAddVenueDialog}
            breweryId={breweryId}
            onVenueAdded={handleVenueAdded}
          />
          
          <EditVenueDialog
            open={!!editingVenue}
            onOpenChange={(open) => !open && setEditingVenue(null)}
            venue={editingVenue}
            onVenueUpdated={updateVenue}
            isUpdating={isUpdating}
          />
        </>
      )}
    </div>
  );
};

export default VenueManagement;
