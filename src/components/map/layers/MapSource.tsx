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
    const addSource = () => {
      if (!map.isStyleLoaded()) {
        console.log('Waiting for map style to load before adding source...');
        requestAnimationFrame(addSource);
        return;
      }

      try {
        // Create a clean array of features with only necessary data
        const features: Feature<Point, BreweryProperties>[] = breweries
          .filter(brewery => 
            brewery.longitude && 
            brewery.latitude && 
            !isNaN(parseFloat(brewery.longitude)) && 
            !isNaN(parseFloat(brewery.latitude))
          )
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
          }));

        const geojsonData: FeatureCollection<Point, BreweryProperties> = {
          type: 'FeatureCollection',
          features: features
        };

        // Remove existing layers before updating source
        if (map.getLayer('unclustered-point-label')) {
          map.removeLayer('unclustered-point-label');
        }
        if (map.getLayer('unclustered-point')) {
          map.removeLayer('unclustered-point');
        }
        if (map.getLayer('cluster-count')) {
          map.removeLayer('cluster-count');
        }
        if (map.getLayer('clusters')) {
          map.removeLayer('clusters');
        }

        // Check if source exists and update it, or create new one
        const source = map.getSource('breweries') as mapboxgl.GeoJSONSource;
        if (source) {
          source.setData(geojsonData);
        } else {
          map.addSource('breweries', {
            type: 'geojson',
            data: geojsonData,
            cluster: true,
            clusterMaxZoom: 14,
            clusterRadius: 50
          });
        }

        console.log('Source added successfully with', features.length, 'features');
      } catch (error) {
        console.error('Error updating source:', error);
      }
    };

    // Initial attempt to add source
    addSource();

    return () => {
      if (!map.getStyle()) return;
      
      try {
        // Remove layers first
        ['unclustered-point-label', 'unclustered-point', 'cluster-count', 'clusters'].forEach(layer => {
          if (map.getLayer(layer)) {
            map.removeLayer(layer);
          }
        });
        // Then remove source
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