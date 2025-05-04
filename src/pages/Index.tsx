
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Map from '@/components/Map';
import { useVenueData } from '@/hooks/useVenueData';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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
  } = useVenueData();

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

  // Debug: Log when selectedVenue changes
  useEffect(() => {
    console.log('Index: selectedVenue changed to:', selectedVenue?.name || 'null');
    console.log('Index: selectedVenue object:', selectedVenue);
    
    // Track when venue is set from search vs other mechanisms
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

  // Handle venue selection with proper validation
  const handleVenueSelect = (venue) => {
    console.log('Index: handleVenueSelect called with venue:', venue?.name || 'none');
    
    if (venue && venue.id) {
      console.log('Index: Setting selected venue to:', venue.name);
      
      // Create a clean venue object to avoid reference issues
      const venueToSet = { ...venue };
      setSelectedVenue(venueToSet);
      
      // Add debug delay to check if venue was properly set
      setTimeout(() => {
        console.log('Index: After setSelectedVenue, current state is:', 
          selectedVenue?.name || 'null');
      }, 50);
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
