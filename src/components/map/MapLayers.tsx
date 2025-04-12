
import React, { useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import type { Venue } from '@/types/venue';
import MapSource from './layers/MapSource';
import ClusterLayers from './layers/ClusterLayers';
import VenuePoints from './layers/VenuePoints';

interface MapLayersProps {
  map: mapboxgl.Map;
  venues: Venue[];
  visitedVenueIds?: string[];
  onVenueSelect: (venue: Venue) => void;
}

const MapLayers = ({ map, venues, visitedVenueIds, onVenueSelect }: MapLayersProps) => {
  const [isMapReady, setIsMapReady] = useState(map.isStyleLoaded());

  // Ensure map is fully loaded before adding layers
  useEffect(() => {
    if (!map) return;
    
    if (!isMapReady) {
      const checkMapReady = () => {
        if (map.isStyleLoaded()) {
          setIsMapReady(true);
        }
      };
      
      checkMapReady();
      
      // If not ready, listen for the style.load event
      if (!isMapReady) {
        map.once('style.load', () => {
          setIsMapReady(true);
        });
      }
    }
    
    return () => {
      // Clean up any event listeners if needed
    };
  }, [map, isMapReady]);
  
  // Don't render layers until map is ready
  if (!isMapReady) {
    return null;
  }

  return (
    <MapSource map={map} venues={venues}>
      <ClusterLayers map={map} source="venues" />
      <VenuePoints map={map} source="venues" visitedVenueIds={visitedVenueIds} />
    </MapSource>
  );
};

export default MapLayers;
