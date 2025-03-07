
import React from 'react';
import mapboxgl from 'mapbox-gl';
import type { Brewery } from '@/types/brewery';
import MapSource from './layers/MapSource';
import ClusterLayers from './layers/ClusterLayers';
import BreweryPoints from './layers/BreweryPoints';

interface MapLayersProps {
  map: mapboxgl.Map;
  breweries: Brewery[];
  visitedBreweryIds?: string[];
  onBrewerySelect: (brewery: Brewery) => void;
}

const MapLayers = ({ map, breweries, visitedBreweryIds, onBrewerySelect }: MapLayersProps) => {
  return (
    <MapSource map={map} breweries={breweries}>
      <ClusterLayers map={map} source="breweries" />
      <BreweryPoints map={map} source="breweries" visitedBreweryIds={visitedBreweryIds} />
    </MapSource>
  );
};

export default MapLayers;
