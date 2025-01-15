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
        if (map.getSource('breweries')) {
          map.removeSource('breweries');
        }

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

    if (map.loaded()) {
      addSource();
    } else {
      map.once('load', addSource);
    }

    return () => {
      if (!map || !map.getStyle()) return;
      
      try {
        if (map.getSource('breweries')) {
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