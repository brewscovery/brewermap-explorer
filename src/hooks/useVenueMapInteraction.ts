
import { useState, useEffect, useCallback, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import type { Venue } from '@/types/venue';

interface UseVenueMapInteractionProps {
  map: mapboxgl.Map | null;
  onVenueSelect: (venue: Venue | null) => void;
  selectedVenueFromProps: Venue | null;
}

export const useVenueMapInteraction = ({ 
  map, 
  onVenueSelect,
  selectedVenueFromProps 
}: UseVenueMapInteractionProps) => {
  const [localSelectedVenue, setLocalSelectedVenue] = useState<Venue | null>(null);
  const lastSelectionTimeRef = useRef<number>(0);
  const selectionSourceRef = useRef<'props' | 'click' | null>(null);
  
  // Use either the prop value or local state
  const selectedVenue = selectedVenueFromProps || localSelectedVenue;
  
  // Update local selected venue and zoom map when selectedVenueFromProps changes
  useEffect(() => {
    // Skip if selection came from our own click handling to prevent duplicate processing
    if (selectionSourceRef.current === 'click') {
      console.log('Skipping prop-based venue update, venue was selected via map click');
      selectionSourceRef.current = null;
      return;
    }
    
    if (selectedVenueFromProps) {
      console.log('Map received selected venue from props:', selectedVenueFromProps.name);
      selectionSourceRef.current = 'props';
      
      // Only update local state if it's different
      if (!localSelectedVenue || localSelectedVenue.id !== selectedVenueFromProps.id) {
        setLocalSelectedVenue(selectedVenueFromProps);
      }
      
      // Zoom to venue location if map is ready
      if (map && selectedVenueFromProps.latitude && selectedVenueFromProps.longitude) {
        try {
          console.log('Zooming map to venue coordinates:', {
            lng: selectedVenueFromProps.longitude,
            lat: selectedVenueFromProps.latitude
          });
          
          const headerHeight = 73;
          const drawerHeight = window.innerHeight * 0.5; // 50% of viewport
          
          map.flyTo({
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
            mapReady: !!map,
            lng: selectedVenueFromProps.longitude,
            lat: selectedVenueFromProps.latitude
          }
        );
      }
    } else if (selectionSourceRef.current === 'props') {
      // Only clear local state when props are null and the source was props
      setLocalSelectedVenue(null);
      selectionSourceRef.current = null;
    }
  }, [selectedVenueFromProps, map, localSelectedVenue]);

  const handleVenueSelect = useCallback((venue: Venue) => {
    console.log('Map handleVenueSelect called with venue:', venue.name);
    
    // Prevent duplicate calls within 500ms
    const now = Date.now();
    if (now - lastSelectionTimeRef.current < 500) {
      console.log('Ignoring duplicate venue selection within 500ms');
      return;
    }
    
    lastSelectionTimeRef.current = now;
    selectionSourceRef.current = 'click';
    
    // Prevent unnecessary updates if it's the same venue
    if (selectedVenue && venue.id === selectedVenue.id) {
      console.log('Skipping venue selection, already selected:', venue.name);
      return;
    }
    
    if (map && venue.latitude && venue.longitude) {
      const headerHeight = 73;
      const drawerHeight = window.innerHeight * 0.5; // 50% of the viewport height
      
      try {
        console.log('Zooming map to venue coordinates:', {
          lng: venue.longitude,
          lat: venue.latitude
        });
        
        map.flyTo({
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
  }, [map, onVenueSelect, selectedVenue]);

  const handleSidebarClose = useCallback(() => {
    console.log('Map: handleSidebarClose called');
    setLocalSelectedVenue(null);
    selectionSourceRef.current = null;
    // Also notify parent component
    onVenueSelect(null);
  }, [onVenueSelect]);

  return {
    selectedVenue,
    handleVenueSelect,
    handleSidebarClose
  };
};
