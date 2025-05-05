
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
  const queryClient = useQueryClient();
  const [localSelectedVenue, setLocalSelectedVenue] = useState<Venue | null>(selectedVenue || null);
  const hasInitiallyRendered = useRef(false);
  const venueZoomAttempted = useRef(false);
  
  // Log initial props and state
  useEffect(() => {
    console.log('Map: Component mounted with props.selectedVenue:', selectedVenue?.name || 'null');
    console.log('Map: Initial localSelectedVenue:', localSelectedVenue?.name || 'null');
  }, []);
  
  // Sync local state with prop whenever the selectedVenue prop changes
  useEffect(() => {
    // Use stringified comparison to detect actual data changes
    const currentJSON = localSelectedVenue ? JSON.stringify(localSelectedVenue) : 'null';
    const incomingJSON = selectedVenue ? JSON.stringify(selectedVenue) : 'null';
    
    // Only update if there's an actual change in the data
    if (currentJSON !== incomingJSON) {
      console.log('Map: Syncing local state with new selectedVenue prop:', selectedVenue?.name || 'null');
      
      // Deep copy to ensure no reference issues
      const venueCopy = selectedVenue ? JSON.parse(JSON.stringify(selectedVenue)) : null;
      setLocalSelectedVenue(venueCopy);
      
      // Reset zoom attempt flag to ensure we try zooming again with new venue
      venueZoomAttempted.current = false;
    }
  }, [selectedVenue, localSelectedVenue]);
  
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

  // Update map when localSelectedVenue changes (zoom to venue location)
  useEffect(() => {
    // Only proceed if we have all the necessary pieces and haven't already attempted to zoom
    if (!localSelectedVenue || !map.current || !isStyleLoaded || venueZoomAttempted.current) {
      return;
    }
    
    console.log('Map: Attempting to zoom to venue:', localSelectedVenue.name);
    console.log('Map: Venue coordinates:', {
      lat: localSelectedVenue.latitude,
      lng: localSelectedVenue.longitude
    });
    
    if (!localSelectedVenue.latitude || !localSelectedVenue.longitude) {
      console.warn('Cannot zoom to venue: Missing coordinates');
      return;
    }
    
    try {
      // Mark that we've attempted to zoom to this venue
      venueZoomAttempted.current = true;
      
      // Parse coordinates to handle both string and number formats
      const lat = parseFloat(String(localSelectedVenue.latitude));
      const lng = parseFloat(String(localSelectedVenue.longitude));
      
      if (isNaN(lat) || isNaN(lng)) {
        console.error('Invalid coordinates:', { lat, lng });
        return;
      }
      
      // Calculate offset for the drawer
      const headerHeight = 73;
      const drawerHeight = window.innerHeight * 0.5; // 50% of viewport
      
      // Use a timeout to ensure the map is fully initialized
      setTimeout(() => {
        if (map.current) {
          console.log('Map: Executing flyTo with coordinates:', { lng, lat });
          
          map.current.flyTo({
            center: [lng, lat],
            offset: [0, -(drawerHeight / 2)], // Offset for drawer
            zoom: 15,
            essential: true, // This ensures the animation completes
            duration: 1500
          });
          
          console.log('Map: flyTo method executed');
          
          // Force a map render
          map.current.triggerRepaint();
        }
      }, 300); // Increased timeout to ensure map is ready
    } catch (error) {
      console.error('Error zooming to venue:', error);
    }
  }, [localSelectedVenue, map, isStyleLoaded]);

  const handleVenueSelect = useCallback((venue: Venue) => {
    console.log('Map: handleVenueSelect called with venue:', venue?.name || 'none');
    
    if (venue) {
      console.log('Map: Venue coordinates:', {
        lat: venue.latitude,
        lng: venue.longitude
      });
      
      // Create a deep copy to avoid reference issues
      const venueCopy = JSON.parse(JSON.stringify(venue));
      
      // Ensure coordinates are strings (mapbox requires this)
      if (venueCopy.latitude && venueCopy.longitude) {
        venueCopy.latitude = String(venueCopy.latitude);
        venueCopy.longitude = String(venueCopy.longitude);
      }
      
      // Update local state first
      setLocalSelectedVenue(venueCopy);
      
      // Also notify parent component with the copy
      onVenueSelect(venueCopy);
      
      // Reset zoom attempt flag
      venueZoomAttempted.current = false;
      
      console.log('Map: onVenueSelect parent handler called with venue:', venueCopy.name);
    }
  }, [onVenueSelect]);

  const handleSidebarClose = useCallback(() => {
    console.log('Map: handleSidebarClose called');
    // Update local state
    setLocalSelectedVenue(null);
    // Notify parent component
    onVenueSelect(null);
    console.log('Map: onVenueSelect parent handler called with null');
  }, [onVenueSelect]);

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
      
      {/* Enhanced debug info */}
      {process.env.NODE_ENV !== 'production' && (
        <div className="absolute top-20 left-4 p-2 bg-white/80 text-xs text-black rounded shadow z-50 max-w-xs overflow-auto max-h-96">
          <div className="mb-2 font-bold text-sm">Debug Info:</div>
          <div>Map Ready: {map.current ? 'Yes' : 'No'}</div>
          <div>Styles Loaded: {isStyleLoaded ? 'Yes' : 'No'}</div>
          <div>Zoom Attempted: {venueZoomAttempted.current ? 'Yes' : 'No'}</div>
          <div className="mt-2 font-bold">Venue Selection:</div>
          <div>Selected Venue: {localSelectedVenue?.name || 'None'}</div>
          <div>Prop Venue: {selectedVenue?.name || 'None'}</div>
          {localSelectedVenue && (
            <>
              <div className="mt-2 font-bold">Venue Details:</div>
              <div>ID: {localSelectedVenue.id || 'N/A'}</div>
              <div>Name: {localSelectedVenue.name || 'N/A'}</div>
              <div>Lat: {localSelectedVenue.latitude || 'N/A'}</div>
              <div>Lng: {localSelectedVenue.longitude || 'N/A'}</div>
              <div>City: {localSelectedVenue.city || 'N/A'}</div>
            </>
          )}
        </div>
      )}
      
      {/* Only render sidebar if we have a valid selected venue */}
      {localSelectedVenue && localSelectedVenue.id && localSelectedVenue.name && (
        <VenueSidebar 
          venue={localSelectedVenue} 
          onClose={handleSidebarClose}
        />
      )}
    </div>
  );
};

export default Map;
