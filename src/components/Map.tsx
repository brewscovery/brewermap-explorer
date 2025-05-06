
import React, { useEffect, useState, useCallback, useRef } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Venue } from '@/types/venue';
import MapLayers from './map/MapLayers';
import MapInteractions from './map/MapInteractions';
import MapGeolocation from './map/MapGeolocation';
import { useMapInitialization } from '@/hooks/useMapInitialization';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import VenueSidebar from './venue/VenueSidebar';

interface MapProps {
  venues: Venue[];
  onVenueSelect: (venue: Venue | null) => void;
  selectedVenue?: Venue | null;
}

const Map = ({ venues, onVenueSelect, selectedVenue: selectedVenueFromProps }: MapProps) => {
  const { user } = useAuth();
  const { mapContainer, map, isStyleLoaded } = useMapInitialization();
  const [visitedVenueIds, setVisitedVenueIds] = useState<string[]>([]);
  const [localSelectedVenue, setLocalSelectedVenue] = useState<Venue | null>(null);
  const queryClient = useQueryClient();
  
  // Use either the prop value or local state
  const selectedVenue = selectedVenueFromProps || localSelectedVenue;
  
  console.log('Map: Render with selectedVenue:', selectedVenue?.name || 'null');

  const { data: checkins, isLoading } = useQuery({
    queryKey: ['checkins', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('checkins')
        .select('venue_id')
        .eq('user_id', user.id);
      
      if (error) throw error;
      console.log(`Fetched ${data?.length || 0} check-ins for user ${user.id}`);
      return data || [];
    },
    enabled: !!user
  });

  const updateMap = useCallback(() => {
    if (map.current && isStyleLoaded) {
      console.log('Map venues updated, source will be refreshed');
    }
  }, [map, isStyleLoaded]);

  useEffect(() => {
    updateMap();
  }, [venues, updateMap]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('checkins-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'checkins',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          console.log('Checkin data changed, invalidating query');
          queryClient.invalidateQueries({ queryKey: ['checkins', user.id] });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user, queryClient]);

  useEffect(() => {
    if (user && checkins) {
      const uniqueVenueIds = [...new Set(checkins.map(checkin => checkin.venue_id))];
      console.log(`Setting ${uniqueVenueIds.length} unique visited venue IDs`);
      setVisitedVenueIds(uniqueVenueIds);
    } else if (!isLoading) {
      console.log('No user or checkins, clearing visited venue IDs');
      setVisitedVenueIds([]);
    }
  }, [checkins, user, isLoading]);

  // Update local selected venue and zoom map when selectedVenueFromProps changes
  useEffect(() => {
    if (selectedVenueFromProps) {
      console.log('Map received selected venue from props:', selectedVenueFromProps.name);
      setLocalSelectedVenue(selectedVenueFromProps);
      
      // Zoom to venue location if map is ready
      if (map.current && selectedVenueFromProps.latitude && selectedVenueFromProps.longitude) {
        try {
          console.log('Zooming map to venue coordinates:', {
            lng: selectedVenueFromProps.longitude,
            lat: selectedVenueFromProps.latitude
          });
          
          const headerHeight = 73;
          const drawerHeight = window.innerHeight * 0.5; // 50% of viewport
          
          map.current.flyTo({
            center: [
              parseFloat(selectedVenueFromProps.longitude), 
              parseFloat(selectedVenueFromProps.latitude)
            ],
            offset: [0, -(drawerHeight / 2)], // Offset for drawer
            zoom: 15,
            duration: 1500
          });
        } catch (error) {
          console.error('Error zooming to venue:', error);
        }
      } else {
        console.warn(
          'Cannot zoom to venue: Map not ready or venue missing coordinates',
          {
            mapReady: !!map.current,
            lng: selectedVenueFromProps.longitude,
            lat: selectedVenueFromProps.latitude
          }
        );
      }
    } else {
      // Clear local state when props are null
      setLocalSelectedVenue(null);
    }
  }, [selectedVenueFromProps, map]);

  const handleVenueSelect = (venue: Venue) => {
    console.log('Map handleVenueSelect called with venue:', venue.name);
    
    if (map.current && venue.latitude && venue.longitude) {
      const headerHeight = 73;
      const drawerHeight = window.innerHeight * 0.5; // 50% of the viewport height
      
      try {
        console.log('Zooming map to venue coordinates:', {
          lng: venue.longitude,
          lat: venue.latitude
        });
        
        map.current.flyTo({
          center: [parseFloat(venue.longitude), parseFloat(venue.latitude)],
          offset: [0, -(drawerHeight / 2)], // Offset to account for the drawer
          zoom: 15,
          duration: 1500
        });
      } catch (error) {
        console.error('Error in flyTo:', error);
      }
    }
    
    setLocalSelectedVenue(venue);
    onVenueSelect(venue);
  };

  const handleSidebarClose = () => {
    console.log('Map: handleSidebarClose called');
    setLocalSelectedVenue(null);
    // Also notify parent component
    onVenueSelect(null);
  };

  return (
    <div className="relative flex-1 w-full h-full">
      <div 
        ref={mapContainer} 
        className="absolute inset-0"
      />
      {map.current && isStyleLoaded && (
        <>
          <MapGeolocation map={map.current} />
          <MapLayers
            map={map.current}
            venues={venues}
            visitedVenueIds={visitedVenueIds}
            onVenueSelect={handleVenueSelect}
          />
          <MapInteractions
            map={map.current}
            venues={venues}
            onVenueSelect={handleVenueSelect}
          />
        </>
      )}
      
      {selectedVenue && (
        <VenueSidebar 
          venue={selectedVenue} 
          onClose={handleSidebarClose}
        />
      )}
    </div>
  );
};

export default Map;
