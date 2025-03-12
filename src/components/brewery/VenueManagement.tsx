
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, MapPin } from 'lucide-react';
import { useBreweryVenues } from '@/hooks/useBreweryVenues';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import AddVenueDialog from './AddVenueDialog';

interface VenueManagementProps {
  breweryId: string | null;
}

const VenueManagement = ({ breweryId }: VenueManagementProps) => {
  const [showAddVenueDialog, setShowAddVenueDialog] = useState(false);
  const { venues, isLoading, refetch } = useBreweryVenues(breweryId);
  
  const handleVenueAdded = () => {
    refetch();
  };
  
  if (isLoading) {
    return <div className="text-center p-4">Loading venues...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Your Venues</h3>
        <Button onClick={() => setShowAddVenueDialog(true)}>
          <Plus className="mr-2" size={18} />
          Add Venue
        </Button>
      </div>
      
      {venues.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-6">
              <MapPin className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
              <h3 className="text-lg font-medium">No venues found</h3>
              <p className="text-muted-foreground mt-2">
                Add your first venue to help customers find your brewery locations.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {venues.map((venue) => (
            <Card key={venue.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">{venue.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  {venue.street && <p>{venue.street}</p>}
                  <p>{venue.city}, {venue.state} {venue.postal_code || ''}</p>
                  {venue.phone && <p className="mt-2">Phone: {venue.phone}</p>}
                  {venue.website_url && (
                    <p className="mt-1">
                      <a 
                        href={venue.website_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        Website
                      </a>
                    </p>
                  )}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm">Edit</Button>
                  <Button variant="outline" size="sm" className="text-destructive">Delete</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {breweryId && (
        <AddVenueDialog
          open={showAddVenueDialog}
          onOpenChange={setShowAddVenueDialog}
          breweryId={breweryId}
          onVenueAdded={handleVenueAdded}
        />
      )}
    </div>
  );
};

export default VenueManagement;
