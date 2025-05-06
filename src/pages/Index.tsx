
import { useEffect, useState } from 'react';
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
  const [isVenueLoading, setIsVenueLoading] = useState(false);
  const [venueLoadError, setVenueLoadError] = useState<string | null>(null);
  
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

  // Handle venueId from URL parameter
  useEffect(() => {
    const venueId = searchParams.get('venueId');
    
    if (venueId) {
      console.log('Found venueId in URL:', venueId);
      setIsVenueLoading(true);
      setVenueLoadError(null);
      
      // First try to find the venue in our loaded venues
      if (venues.length > 0) {
        const venue = venues.find(v => v.id === venueId);
        
        if (venue) {
          console.log('Found venue from URL parameter in local data:', venue.name);
          setSelectedVenue(venue);
          setIsVenueLoading(false);
          return; // Exit early if we found the venue locally
        }
      }
      
      // If venue is not in our loaded venues, fetch it directly
      const fetchVenue = async () => {
        try {
          console.log('Fetching venue data for ID:', venueId);
          const { data, error } = await supabase
            .from('venues')
            .select('*')
            .eq('id', venueId)
            .single();
            
          if (error) {
            console.error('Error fetching venue from ID:', error);
            setVenueLoadError(error.message);
            toast.error('Could not find the selected venue');
            setIsVenueLoading(false);
            return;
          }
          
          if (data) {
            console.log('Successfully fetched venue from URL parameter:', data.name);
            // Cast the data to Venue type to ensure compatibility
            setSelectedVenue(data as Venue);
          } else {
            console.error('No venue data returned for ID:', venueId);
            setVenueLoadError('Venue not found');
            toast.error('Could not find the selected venue');
          }
        } catch (error) {
          console.error('Exception when fetching venue:', error);
          setVenueLoadError(error instanceof Error ? error.message : 'Unknown error');
          toast.error('Could not find the selected venue');
        } finally {
          setIsVenueLoading(false);
        }
      };
      
      fetchVenue();
    }
  }, [searchParams, venues, setSelectedVenue]);

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

  // Render a simple loading state when fetching venue from URL
  if (isVenueLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading venue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Floating UI Elements */}
      <FloatingSearchBar onVenueSelect={handleVenueSelect} />
      <FloatingAuthButtons />
      
      <Map
        venues={venues}
        onVenueSelect={handleVenueSelect}
        selectedVenue={selectedVenue}
      />
      
      {/* Error indication - only show if there's an error and no map */}
      {venueLoadError && (
        <div className="absolute top-20 left-0 right-0 mx-auto w-max bg-destructive text-destructive-foreground px-4 py-2 rounded shadow-lg">
          Failed to load venue: {venueLoadError}
        </div>
      )}
    </div>
  );
};

export default Index;
