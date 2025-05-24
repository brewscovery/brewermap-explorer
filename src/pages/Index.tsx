
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Map from '@/components/Map';
import { useVenueData } from '@/hooks/useVenueData';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import FloatingSearchBar from '@/components/search/FloatingSearchBar';
import { supabase } from '@/integrations/supabase/client';
import type { Venue } from '@/types/venue';
import { CheckInDialog } from '@/components/CheckInDialog';
import { useState } from 'react';

const Index = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [isCheckInDialogOpen, setIsCheckInDialogOpen] = useState(false);
  
  const {
    venues,
    allVenues,
    error,
    refetch,
    selectedVenue,
    setSelectedVenue,
    activeFilters,
    handleFilterChange,
    lastFilterUpdateTime
  } = useVenueData();

  // Handle auth redirects for recovery/signup flows
  useEffect(() => {
    const type = searchParams.get('type');
    const token = searchParams.get('token');
    
    if ((type === 'recovery' || type === 'signup') && token && !user) {
      navigate('/auth' + window.location.search);
    }
  }, [navigate, searchParams, user]);

  // Handle QR code flow when user becomes authenticated
  useEffect(() => {
    if (user) {
      // Check for stored venue ID from QR code flow
      const qrCheckInVenueId = sessionStorage.getItem('qr_checkin_venue_id');
      if (qrCheckInVenueId) {
        console.log('Processing stored QR check-in venue ID:', qrCheckInVenueId);
        // Clear the stored venue ID immediately
        sessionStorage.removeItem('qr_checkin_venue_id');
        
        // Navigate to the venue with check-in action
        navigate(`/?venueId=${qrCheckInVenueId}&action=check-in`, { replace: true });
        return; // Exit early, let the URL parameter handling take over
      }
    }
  }, [user, navigate]);

  // Handle venueId from URL parameter
  useEffect(() => {
    const venueId = searchParams.get('venueId');
    const action = searchParams.get('action');
    
    if (venueId && allVenues.length > 0) {
      // First try to find the venue in our loaded venues
      const venue = allVenues.find(v => v.id === venueId);
      
      if (venue) {
        console.log('Found venue from URL parameter:', venue.name);
        setSelectedVenue(venue);
        
        // If action is check-in, open the check-in dialog
        if (action === 'check-in' && user) {
          console.log('Opening check-in dialog for venue:', venue.name);
          setTimeout(() => {
            setIsCheckInDialogOpen(true);
          }, 100); // Small delay to ensure venue is selected first
        }
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
              
              // If action is check-in, open the check-in dialog
              if (action === 'check-in' && user) {
                console.log('Opening check-in dialog for venue:', data.name);
                setTimeout(() => {
                  setIsCheckInDialogOpen(true);
                }, 100); // Small delay to ensure venue is selected first
              }
            }
          } catch (error) {
            console.error('Error fetching venue from ID:', error);
            toast.error('Could not find the selected venue');
          }
        };
        
        fetchVenue();
      }
    }
  }, [searchParams, allVenues, setSelectedVenue, user]);

  // Handle venue data errors
  useEffect(() => {
    if (error) {
      toast.error('Failed to load venues');
    }
  }, [error]);

  // Handle venue selection without triggering unnecessary refetching
  const handleVenueSelect = (venue: Venue | null) => {
    // Skip if it's the same venue to prevent unnecessary re-renders
    if (selectedVenue && venue && selectedVenue.id === venue.id) {
      console.log('Index page: Skipping venue selection, already selected:', venue.name);
      return;
    }
    
    console.log('Index page: Setting selected venue:', venue?.name || 'none');
    // Update the selected venue in the global state
    setSelectedVenue(venue);
  };

  const handleCheckInSuccess = () => {
    setIsCheckInDialogOpen(false);
    // Clear the action parameter from URL
    navigate(`/?venueId=${selectedVenue?.id || ''}`, { replace: true });
    toast.success('Check-in successful!');
  };

  const handleCheckInClose = () => {
    console.log('Index page: Closing check-in dialog');
    setIsCheckInDialogOpen(false);
    // Clear the action parameter from URL if it exists
    if (searchParams.get('action') === 'check-in') {
      navigate(`/?venueId=${selectedVenue?.id || ''}`, { replace: true });
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Floating UI Elements */}
      <FloatingSearchBar 
        onVenueSelect={handleVenueSelect} 
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        selectedVenue={selectedVenue}
      />
      
      <Map
        venues={venues}
        onVenueSelect={handleVenueSelect}
        selectedVenue={selectedVenue}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        lastFilterUpdateTime={lastFilterUpdateTime}
      />

      {/* Check-in dialog - now with improved z-index and event handling */}
      {selectedVenue && user && (
        <div className="fixed inset-0 z-[300] pointer-events-none">
          <div className="pointer-events-auto">
            <CheckInDialog
              venue={selectedVenue}
              isOpen={isCheckInDialogOpen}
              onClose={handleCheckInClose}
              onSuccess={handleCheckInSuccess}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
