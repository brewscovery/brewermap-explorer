import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import type { Brewery } from '@/types/brewery';
import type { Feature, Point, FeatureCollection } from 'geojson';

interface MapSourceProps {
  map: mapboxgl.Map;
  breweries: Brewery[];
  children: React.ReactNode;
}

interface BreweryProperties {
  id: string;
  name: string;
}

const MapSource = ({ map, breweries, children }: MapSourceProps) => {
  useEffect(() => {
    const updateSource = () => {
      // Wait for map style to be loaded
      if (!map.isStyleLoaded()) {
        console.log('Map style not loaded, waiting...');
        map.once('style.load', updateSource);
        return;
      }

      try {
        const geojsonData: FeatureCollection<Point, BreweryProperties> = {
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
        };

        const source = map.getSource('breweries') as mapboxgl.GeoJSONSource;
        
        if (source) {
          console.log('Updating existing source with', breweries.length, 'breweries');
          source.setData(geojsonData);
        } else {
          console.log('Creating new source with', breweries.length, 'breweries');
          map.addSource('breweries', {
            type: 'geojson',
            data: geojsonData,
            cluster: true,
            clusterMaxZoom: 14,
            clusterRadius: 50
          });
        }
      } catch (error) {
        console.error('Error updating source:', error);
      }
    };

    updateSource();

    return () => {
      if (!map.getStyle()) return;
      
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