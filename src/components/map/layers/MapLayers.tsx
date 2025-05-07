
import React from 'react';
import mapboxgl from 'mapbox-gl';
import type { Venue } from '@/types/venue';
import MapSource from './MapSource';
import ClusterLayers from './ClusterLayers';
import VenuePoints from './VenuePoints';

interface MapLayersProps {
  map: mapboxgl.Map;
  venues: Venue[];
  visitedVenueIds?: string[];
  onVenueSelect: (venue: Venue) => void;
}

const MapLayers = ({ map, venues, visitedVenueIds, onVenueSelect }: MapLayersProps) => {
  console.log(`MapLayers rendering with ${venues.length} venues and ${visitedVenueIds?.length || 0} visited venues`);
  
  // Use a unique key based on venues length to force re-mounting when venue count changes
  const sourceKey = `venues-source-${venues.length}`;
  
  return (
    <MapSource map={map} venues={venues} key={sourceKey}>
      <ClusterLayers map={map} source="venues" />
      <VenuePoints 
        map={map} 
        source="venues" 
        visitedVenueIds={visitedVenueIds} 
        onVenueSelect={onVenueSelect} 
      />
    </MapSource>
  );
};

export default MapLayers;
