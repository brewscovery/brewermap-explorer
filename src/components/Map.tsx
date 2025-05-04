
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

const Map = ({ venues, onVenueSelect, selectedVenue }: MapProps) => {
  const { user } = useAuth();
  const { mapContainer, map, isStyleLoaded } = useMapInitialization();
  const [visitedVenueIds, setVisitedVenueIds] = useState<string[]>([]);
  const [localSelectedVenue, setLocalSelectedVenue] = useState<Venue | null>(null);
  const queryClient = useQueryClient();
  
  // Use either the prop value or local state
  const selectedVenueToShow = selectedVenue || localSelectedVenue;
  
  // Debug: Log when props change
  useEffect(() => {
    console.log('Map: selectedVenue prop changed to:', selectedVenue?.name || 'null');
    if (selectedVenue) {
      console.log('Map: selectedVenue coordinates:', {
        lat: selectedVenue.latitude,
        lng: selectedVenue.longitude
      });
    }
  }, [selectedVenue]);

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

  // Update local selected venue and zoom map when selectedVenue prop changes
  useEffect(() => {
    if (selectedVenue) {
      console.log('Map: Handling selectedVenue change:', selectedVenue.name);
      setLocalSelectedVenue(selectedVenue);
      
      // Zoom to venue location if map is ready
      if (map.current && selectedVenue.latitude && selectedVenue.longitude) {
        try {
          console.log('Map: Zooming map to venue coordinates:', {
            lng: selectedVenue.longitude,
            lat: selectedVenue.latitude
          });
          
          const headerHeight = 73;
          const drawerHeight = window.innerHeight * 0.5; // 50% of viewport
          
          map.current.flyTo({
            center: [
              parseFloat(selectedVenue.longitude), 
              parseFloat(selectedVenue.latitude)
            ],
            offset: [0, -(drawerHeight / 2)], // Offset for drawer
            zoom: 15,
            duration: 1500
          });
          
          console.log('Map: flyTo method called successfully');
        } catch (error) {
          console.error('Error zooming to venue:', error);
        }
      } else {
        console.warn(
          'Cannot zoom to venue: Map not ready or venue missing coordinates',
          {
            mapReady: !!map.current,
            lng: selectedVenue.longitude,
            lat: selectedVenue.latitude,
            isStyleLoaded: isStyleLoaded
          }
        );
      }
    }
  }, [selectedVenue, isStyleLoaded]);

  const handleVenueSelect = (venue: Venue) => {
    console.log('Map: handleVenueSelect called with venue:', venue?.name || 'none');
    
    if (map.current && venue?.latitude && venue?.longitude) {
      const headerHeight = 73;
      const drawerHeight = window.innerHeight * 0.5; // 50% of the viewport height
      
      try {
        console.log('Map: Zooming map to venue coordinates:', {
          lng: venue.longitude,
          lat: venue.latitude
        });
        
        map.current.flyTo({
          center: [parseFloat(venue.longitude), parseFloat(venue.latitude)],
          offset: [0, -(drawerHeight / 2)], // Offset to account for the drawer
          zoom: 15,
          duration: 1500
        });
        
        console.log('Map: flyTo method called successfully for direct selection');
      } catch (error) {
        console.error('Error in flyTo:', error);
      }
    } else {
      console.warn('Map: Cannot zoom to venue - invalid coordinates or map not ready');
    }
    
    setLocalSelectedVenue(venue);
    console.log('Map: setLocalSelectedVenue called with venue:', venue?.name || 'none');
    
    // Also notify parent component
    onVenueSelect(venue);
    console.log('Map: onVenueSelect parent handler called');
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
      
      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-20 left-4 p-2 bg-white/80 text-xs text-black rounded shadow z-50 max-w-xs">
          <div>Map Ready: {map.current ? 'Yes' : 'No'}</div>
          <div>Styles Loaded: {isStyleLoaded ? 'Yes' : 'No'}</div>
          <div>Selected Venue: {selectedVenueToShow?.name || 'None'}</div>
          {selectedVenueToShow && (
            <>
              <div>Lat: {selectedVenueToShow.latitude || 'N/A'}</div>
              <div>Lng: {selectedVenueToShow.longitude || 'N/A'}</div>
            </>
          )}
        </div>
      )}
      
      {selectedVenueToShow && (
        <VenueSidebar 
          venue={selectedVenueToShow} 
          onClose={handleSidebarClose}
        />
      )}
    </div>
  );
};

export default Map;
