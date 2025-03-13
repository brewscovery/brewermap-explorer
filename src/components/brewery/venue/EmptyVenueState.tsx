
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Plus } from 'lucide-react';

interface EmptyVenueStateProps {
  onAddVenue: () => void;
}

const EmptyVenueState = ({ onAddVenue }: EmptyVenueStateProps) => {
  return (
    <Card className="border-dashed bg-muted/40">
      <CardContent className="pt-6">
        <div className="text-center py-8">
          <MapPin className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
          <h3 className="text-lg font-medium">No venues found</h3>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            Add your first venue to help customers find your brewery locations. Each venue will appear on the map.
          </p>
          <Button 
            onClick={onAddVenue} 
            className="mt-6"
            variant="outline"
          >
            <Plus className="mr-2" size={16} />
            Add Your First Venue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmptyVenueState;
