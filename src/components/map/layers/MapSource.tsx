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
    const addSource = () => {
      try {
        // Wait for map style to be loaded
        if (!map.isStyleLoaded()) {
          map.once('style.load', addSource);
          return;
        }

        // Remove existing source if it exists
        if (map.getSource('breweries')) {
          map.removeSource('breweries');
        }

        // Add new source
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
      } catch (error) {
        console.warn('Error adding source:', error);
      }
    };

    // Add source when map is ready
    if (map.isStyleLoaded()) {
      addSource();
    } else {
      map.once('style.load', addSource);
    }

    return () => {
      if (!map || !map.getStyle()) return;
      
      try {
        if (map.getSource('breweries')) {
          // Remove all layers that use this source first
          const layers = ['unclustered-point', 'clusters', 'cluster-count'];
          layers.forEach(layer => {
            if (map.getLayer(layer)) {
              map.removeLayer(layer);
            }
          });
          map.removeSource('breweries');
        }
      } catch (error) {
        console.warn('Error cleaning up source:', error);
      }
    };
  }, [map, breweries]);

  return <>{children}</>;
};

export default MapSource;