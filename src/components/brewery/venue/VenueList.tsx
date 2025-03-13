
import { MapPin } from 'lucide-react';
import type { Venue } from '@/types/venue';
import VenueCard from './VenueCard';
import EmptyVenueState from './EmptyVenueState';
import { useVenueRatings } from '@/hooks/useVenueRatings';

interface VenueListProps {
  venues: Venue[];
  isLoading: boolean;
  onEditVenue: (venue: Venue) => void;
  onEditHours: (venue: Venue) => void;
  onDeleteVenue: (venue: Venue) => void;
  onAddVenue: () => void;
}

const VenueList = ({ 
  venues, 
  isLoading, 
  onEditVenue, 
  onEditHours, 
  onDeleteVenue, 
  onAddVenue 
}: VenueListProps) => {
  console.log('Venues in VenueList:', venues);
  
  // Get ratings data for all venues
  const { ratingsData, isLoading: isLoadingRatings, getRatingData } = useVenueRatings(
    venues.map(venue => String(venue.id))
  );
  
  console.log('Ratings data in VenueList:', ratingsData);
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
        <MapPin className="animate-pulse h-10 w-10 mb-2 opacity-50" />
        <p>Loading venues...</p>
      </div>
    );
  }

  if (venues.length === 0) {
    return <EmptyVenueState onAddVenue={onAddVenue} />;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
      {venues.map((venue) => (
        <VenueCard
          key={venue.id}
          venue={venue}
          ratingData={getRatingData(String(venue.id))}
          onEdit={onEditVenue}
          onEditHours={onEditHours}
          onDelete={onDeleteVenue}
        />
      ))}
    </div>
  );
};

export default VenueList;
