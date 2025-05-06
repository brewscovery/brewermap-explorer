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
  const [isMapReady, setIsMapReady] = useState(false);
  
  // Use either the prop value or local state
  const selectedVenue = selectedVenueFromProps || localSelectedVenue;
  
  // Check if map is loaded and ready for interactions
  useEffect(() => {
    if (map) {
      // Function to check if map is truly ready (has a style)
      const checkMapReady = () => {
        if (map.isStyleLoaded()) {
          console.log('Map is fully loaded and ready');
          setIsMapReady(true);
        }
      };

      // Check immediately if map is already loaded
      if (map.isStyleLoaded()) {
        setIsMapReady(true);
      } else {
        // Otherwise wait for the style.load event
        map.once('style.load', () => {
          console.log('Map style loaded event fired');
          setIsMapReady(true);
        });
        
        // Set a timeout as a fallback in case the event doesn't fire
        setTimeout(checkMapReady, 2000);
      }
    }
  }, [map]);
  
  // Update local selected venue and zoom map when selectedVenueFromProps changes
  useEffect(() => {
    if (selectedVenueFromProps) {
      console.log('Map received selected venue from props:', selectedVenueFromProps.name);
      setLocalSelectedVenue(selectedVenueFromProps);
      
      // Only try to zoom if the map is ready and we have valid coordinates
      if (map && isMapReady && selectedVenueFromProps.latitude && selectedVenueFromProps.longitude) {
        try {
          console.log('Zooming map to venue coordinates:', {
            lng: selectedVenueFromProps.longitude,
            lat: selectedVenueFromProps.latitude
          });
          
          // Get viewport dimensions for better positioning
          const isMobile = window.innerWidth < 768;
          const headerHeight = 73;
          const drawerHeight = isMobile 
            ? window.innerHeight * 0.5  // 50% on mobile
            : headerHeight;              // Just header offset on desktop
          
          map.flyTo({
            center: [
              parseFloat(selectedVenueFromProps.longitude), 
              parseFloat(selectedVenueFromProps.latitude)
            ],
            offset: [0, isMobile ? -(drawerHeight / 2) : 0], // Different offset for mobile
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
            mapReady: !!map && isMapReady,
            lng: selectedVenueFromProps.longitude,
            lat: selectedVenueFromProps.latitude
          }
        );
      }
    } else {
      // Clear local state when props are null
      setLocalSelectedVenue(null);
    }
  }, [selectedVenueFromProps, map, isMapReady]);

  const handleVenueSelect = useCallback((venue: Venue) => {
    console.log('Map handleVenueSelect called with venue:', venue.name);
    
    if (map && isMapReady && venue.latitude && venue.longitude) {
      // Different behavior for mobile vs desktop
      const isMobile = window.innerWidth < 768;
      const headerHeight = 73;
      const drawerHeight = isMobile 
        ? window.innerHeight * 0.5  // 50% on mobile
        : headerHeight;              // Just header offset on desktop
      
      try {
        console.log('Zooming map to venue coordinates:', {
          lng: venue.longitude,
          lat: venue.latitude
        });
        
        map.flyTo({
          center: [parseFloat(venue.longitude), parseFloat(venue.latitude)],
          offset: [0, isMobile ? -(drawerHeight / 2) : 0], // Different offset based on device
          zoom: 15,
          duration: 1500
        });
      } catch (error) {
        console.error('Error in flyTo:', error);
      }
    } else {
      console.warn('Cannot zoom to venue: Map not ready or coordinates missing', {
        mapReady: !!map && isMapReady,
        hasCoordinates: !!(venue.latitude && venue.longitude)
      });
    }
    
    setLocalSelectedVenue(venue);
    onVenueSelect(venue);
  }, [map, isMapReady, onVenueSelect]);

  const handleSidebarClose = useCallback(() => {
    console.log('Map: handleSidebarClose called');
    setLocalSelectedVenue(null);
    // Also notify parent component
    onVenueSelect(null);
  }, [onVenueSelect]);

  return {
    selectedVenue,
    handleVenueSelect,
    handleSidebarClose,
    isMapReady
  };
};
