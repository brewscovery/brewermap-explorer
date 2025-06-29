
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Map from '@/components/Map';
import { useProgressiveVenueData } from '@/hooks/useProgressiveVenueData';
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
    isLoading,
    isLoadingMore,
    hasMoreVenues,
    loadingProgress,
    totalVenueCount,
    refetch,
    selectedVenue,
    setSelectedVenue,
    activeFilters,
    handleFilterChange,
    lastFilterUpdateTime
  } = useProgressiveVenueData();

  console.log(`Index: Progressive loading - ${venues.length} venues loaded, ${loadingProgress.toFixed(1)}% complete`);

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
      const qrCheckInVenueId = sessionStorage.getItem('qr_checkin_venue_id');
      if (qrCheckInVenueId) {
        console.log('Processing stored QR check-in venue ID:', qrCheckInVenueId);
        sessionStorage.removeItem('qr_checkin_venue_id');
        navigate(`/?venueId=${qrCheckInVenueId}&action=check-in`, { replace: true });
        return;
      }
    }
  }, [user, navigate]);

  // Handle venueId from URL parameter (optimized)
  useEffect(() => {
    const venueId = searchParams.get('venueId');
    const action = searchParams.get('action');
    
    if (venueId && allVenues.length > 0) {
      // Try to find venue in loaded venues first
      const venue = allVenues.find(v => v.id === venueId);
      
      if (venue) {
        console.log('Found venue from URL parameter (progressive):', venue.name);
        setSelectedVenue(venue);
        
        if (action === 'check-in' && user) {
          setTimeout(() => setIsCheckInDialogOpen(true), 100);
        } else if (action === 'open-venue') {
          navigate(`/?venueId=${venueId}`, { replace: true });
        }
      } else if (!isLoading && !isLoadingMore) {
        // Only fetch directly if we're not currently loading
        const fetchVenue = async () => {
          try {
            console.log('Fetching venue directly (not in progressive load):', venueId);
            const { data, error } = await supabase
              .from('venues')
              .select('*')
              .eq('id', venueId)
              .single();
              
            if (error) throw error;
            
            if (data) {
              console.log('Fetched venue from URL parameter:', data.name);
              setSelectedVenue(data as Venue);
              
              if (action === 'check-in' && user) {
                setTimeout(() => setIsCheckInDialogOpen(true), 100);
              } else if (action === 'open-venue') {
                navigate(`/?venueId=${venueId}`, { replace: true });
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
  }, [searchParams, allVenues, setSelectedVenue, user, navigate, isLoading, isLoadingMore]);

  // Handle venue data errors
  useEffect(() => {
    if (error) {
      toast.error('Failed to load venues');
    }
  }, [error]);

  // Optimized venue selection handler
  const handleVenueSelect = (venue: Venue | null) => {
    if (selectedVenue && venue && selectedVenue.id === venue.id) {
      console.log('Index: Skipping duplicate venue selection:', venue.name);
      return;
    }
    
    console.log('Index: Setting selected venue (progressive):', venue?.name || 'none');
    setSelectedVenue(venue);
  };

  const handleCheckInSuccess = () => {
    setIsCheckInDialogOpen(false);
    navigate(`/?venueId=${selectedVenue?.id || ''}`, { replace: true });
    toast.success('Check-in successful!');
  };

  const handleCheckInClose = () => {
    console.log('Index: Closing check-in dialog (progressive)');
    setIsCheckInDialogOpen(false);
    if (searchParams.get('action') === 'check-in') {
      navigate(`/?venueId=${selectedVenue?.id || ''}`, { replace: true });
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full">
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
        isLoadingVenues={isLoading || isLoadingMore}
        loadingProgress={loadingProgress}
        venueCount={venues.length}
        totalVenueCount={totalVenueCount}
      />

      {selectedVenue && user && (
        <CheckInDialog
          venue={selectedVenue}
          isOpen={isCheckInDialogOpen}
          onClose={handleCheckInClose}
          onSuccess={handleCheckInSuccess}
        />
      )}
    </div>
  );
};

export default Index;
