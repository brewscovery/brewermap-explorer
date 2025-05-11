
import { useState, useEffect, useCallback } from 'react';
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
  
  // Use either the prop value or local state
  const selectedVenue = selectedVenueFromProps || localSelectedVenue;
  
  // Update local selected venue and zoom map when selectedVenueFromProps changes
  useEffect(() => {
    if (selectedVenueFromProps) {
      console.log('Map received selected venue from props:', selectedVenueFromProps.name);
      
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
    } else {
      // Clear local state when props are null
      setLocalSelectedVenue(null);
    }
  }, [selectedVenueFromProps, map]);

  const handleVenueSelect = useCallback((venue: Venue) => {
    console.log('Map handleVenueSelect called with venue:', venue.name);
    
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
    // Also notify parent component
    onVenueSelect(null);
  }, [onVenueSelect]);

  return {
    selectedVenue,
    handleVenueSelect,
    handleSidebarClose
  };
};
