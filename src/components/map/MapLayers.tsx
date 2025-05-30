
import React, { useMemo } from 'react';
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
  console.log(`MapLayers rendering with ${venues.length} venues and ${visitedVenueIds?.length || 0} visited venues`);
  
  // Generate a unique key that changes when venues array changes
  // This ensures proper remounting of components when necessary
  const sourceKey = useMemo(() => 
    `venues-source-${venues.length}-${Date.now()}`, 
    [venues.length]
  );
  
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
