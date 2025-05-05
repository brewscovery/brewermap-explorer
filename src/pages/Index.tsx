
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Map from '@/components/Map';
import { useVenueData } from '@/hooks/useVenueData';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Venue } from '@/types/venue';

const Index = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  const {
    venues,
    error,
    refetch,
    selectedVenue,
    setSelectedVenue,
    hasSelectedVenueChanged
  } = useVenueData();

  // Log Index component mount and venue state
  useEffect(() => {
    console.log('Index: Component mounted with selectedVenue:', selectedVenue?.name || 'null');
    console.log('Index: hasSelectedVenueChanged:', hasSelectedVenueChanged);
  }, [selectedVenue, hasSelectedVenueChanged]);

  // Handle auth redirects for recovery/signup flows
  useEffect(() => {
    const type = searchParams.get('type');
    const token = searchParams.get('token');
    
    if ((type === 'recovery' || type === 'signup') && token && !user) {
      navigate('/auth' + window.location.search);
    }
  }, [navigate, searchParams, user]);

  // Handle venue data errors
  useEffect(() => {
    if (error) {
      toast.error('Failed to load venues');
    }
  }, [error]);

  // Log when selectedVenue changes in Index
  useEffect(() => {
    console.log('Index: selectedVenue changed to:', selectedVenue?.name || 'null');
    
    if (selectedVenue) {
      console.log('Index: Venue is now selected:', {
        id: selectedVenue.id,
        name: selectedVenue.name,
        coords: {
          lat: selectedVenue.latitude,
          lng: selectedVenue.longitude
        }
      });
    }
  }, [selectedVenue]);

  // Handle venue selection with proper deep copying
  const handleVenueSelect = (venue: Venue | null) => {
    console.log('Index: handleVenueSelect called with venue:', venue?.name || 'none');
    
    if (venue && venue.id) {
      console.log('Index: Setting selected venue to:', venue.name);
      
      // Deep copy the venue object to avoid reference issues
      const venueCopy = JSON.parse(JSON.stringify(venue));
      
      // Ensure coordinates are in string format
      if (venueCopy.latitude && venueCopy.longitude) {
        venueCopy.latitude = String(venueCopy.latitude);
        venueCopy.longitude = String(venueCopy.longitude);
      }
      
      // Pass the deep copy to the state setter
      setSelectedVenue(venueCopy);
    } else if (venue === null) {
      console.log('Index: Setting selected venue to null');
      setSelectedVenue(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      <Map
        venues={venues}
        onVenueSelect={handleVenueSelect}
        selectedVenue={selectedVenue} 
      />
    </div>
  );
};

export default Index;
