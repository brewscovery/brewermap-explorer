import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import type { Brewery } from '@/types/brewery';

interface MapSourceProps {
  map: mapboxgl.Map;
  breweries: Brewery[];
  children: React.ReactNode;
}

const MapSource = ({ map, breweries, children }: MapSourceProps) => {
  useEffect(() => {
    if (!map.isStyleLoaded()) {
      map.on('style.load', () => {
        addSource();
      });
      return;
    }

    addSource();

    function addSource() {
      // Remove existing source if it exists
      if (map.getSource('breweries')) {
        map.removeSource('breweries');
      }

      // Add a source for brewery points with clustering enabled
      map.addSource('breweries', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: breweries
            .filter(brewery => brewery.longitude && brewery.latitude)
            .map(brewery => ({
              type: 'Feature',
              properties: {
                id: brewery.id,
                name: brewery.name
              },
              geometry: {
                type: 'Point',
                coordinates: [parseFloat(brewery.longitude), parseFloat(brewery.latitude)]
              }
            }))
        },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50
      });
    }

    return () => {
      if (map.getSource('breweries')) {
        map.removeSource('breweries');
      }
    };
  }, [map, breweries]);

  return <>{children}</>;
};

export default MapSource;