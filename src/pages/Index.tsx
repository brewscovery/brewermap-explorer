import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Map from '@/components/Map';
import { useVenueData } from '@/hooks/useVenueData';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import FloatingSearchBar from '@/components/search/FloatingSearchBar';
import FloatingAuthButtons from '@/components/auth/FloatingAuthButtons';
import { supabase } from '@/integrations/supabase/client';
import type { Venue } from '@/types/venue';

const Index = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  const {
    venues,
    allVenues,
    error,
    refetch,
    selectedVenue,
    setSelectedVenue,
    activeFilters,
    handleFilterChange
  } = useVenueData();

  // Handle auth redirects for recovery/signup flows
  useEffect(() => {
    const type = searchParams.get('type');
    const token = searchParams.get('token');
    
    if ((type === 'recovery' || type === 'signup') && token && !user) {
      navigate('/auth' + window.location.search);
    }
  }, [navigate, searchParams, user]);

  // Handle venueId from URL parameter
  useEffect(() => {
    const venueId = searchParams.get('venueId');
    
    if (venueId && allVenues.length > 0) {
      // First try to find the venue in our loaded venues
      const venue = allVenues.find(v => v.id === venueId);
      
      if (venue) {
        console.log('Found venue from URL parameter:', venue.name);
        setSelectedVenue(venue);
      } else {
        // If venue is not in our loaded venues, fetch it directly
        const fetchVenue = async () => {
          try {
            const { data, error } = await supabase
              .from('venues')
              .select('*')
              .eq('id', venueId)
              .single();
              
            if (error) throw error;
            
            if (data) {
              console.log('Fetched venue from URL parameter:', data.name);
              // Cast the data to Venue type to ensure compatibility
              setSelectedVenue(data as Venue);
            }
          } catch (error) {
            console.error('Error fetching venue from ID:', error);
            toast.error('Could not find the selected venue');
          }
        };
        
        fetchVenue();
      }
    }
  }, [searchParams, allVenues, setSelectedVenue]);

  // Handle venue data errors
  useEffect(() => {
    if (error) {
      toast.error('Failed to load venues');
    }
  }, [error]);

  // Handle venue selection
  const handleVenueSelect = (venue) => {
    console.log('Index page: Setting selected venue:', venue?.name || 'none');
    // Update the selected venue in the global state
    setSelectedVenue(venue);
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Floating UI Elements */}
      <FloatingSearchBar 
        onVenueSelect={handleVenueSelect} 
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
      />
      <FloatingAuthButtons />
      
      <Map
        venues={venues}
        onVenueSelect={handleVenueSelect}
        selectedVenue={selectedVenue}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
      />
    </div>
  );
};

export default Index;
