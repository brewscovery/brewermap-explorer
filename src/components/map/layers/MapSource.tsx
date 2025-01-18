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
      if (!map.isStyleLoaded()) {
        map.once('style.load', updateSource);
        return;
      }

      try {
        const source = map.getSource('breweries') as mapboxgl.GeoJSONSource;
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
        
        // If source exists, just update the data
        if (source) {
          source.setData(geojsonData);
        } else {
          // If source doesn't exist, create it
          map.addSource('breweries', {
            type: 'geojson',
            data: geojsonData,
            cluster: true,
            clusterMaxZoom: 14,
            clusterRadius: 50
          });
        }

        console.log('Source updated successfully with', breweries.length, 'breweries');
      } catch (error) {
        console.warn('Error updating source:', error);
      }
    };

    // Update source when map style is loaded
    updateSource();

    return () => {
      if (!map.getStyle()) return;
      
      try {
        const layers = ['unclustered-point', 'clusters', 'cluster-count'];
        layers.forEach(layer => {
          if (map.getLayer(layer)) {
            map.removeLayer(layer);
          }
        });
        
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