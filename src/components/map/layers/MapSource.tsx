
import { useEffect, useRef } from 'react';
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
  const sourceAdded = useRef(false);

  useEffect(() => {
    const createGeoJsonData = () => {
      const features: Feature<Point, BreweryProperties>[] = breweries
        .filter(brewery => {
          const lng = parseFloat(brewery.longitude || '');
          const lat = parseFloat(brewery.latitude || '');
          return !isNaN(lng) && !isNaN(lat);
        })
        .map(brewery => ({
          type: 'Feature',
          properties: {
            id: brewery.id,
            name: brewery.name
          },
          geometry: {
            type: 'Point',
            coordinates: [
              parseFloat(brewery.longitude || '0'),
              parseFloat(brewery.latitude || '0')
            ]
          }
        }));

      return {
        type: 'FeatureCollection',
        features: features
      } as FeatureCollection<Point, BreweryProperties>;
    };

    const setupSource = () => {
      if (!map.isStyleLoaded()) {
        return;
      }

      try {
        // Remove existing source and layers if they exist
        if (map.getSource('breweries')) {
          ['unclustered-point', 'unclustered-point-label', 'cluster-count', 'clusters'].forEach(layer => {
            if (map.getLayer(layer)) {
              map.removeLayer(layer);
            }
          });
          map.removeSource('breweries');
        }

        // Add new source
        map.addSource('breweries', {
          type: 'geojson',
          data: createGeoJsonData(),
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 50
        });
        
        sourceAdded.current = true;
        map.fire('source-added');
      } catch (error) {
        console.warn('Error setting up source:', error);
      }
    };

    const initializeSource = () => {
      if (!map.isStyleLoaded()) {
        map.once('style.load', initializeSource);
        return;
      }

      setupSource();
    };

    // Initial setup
    if (map && breweries.length > 0) {
      initializeSource();
    }

    // Also update source when breweries data changes
    if (sourceAdded.current && map.getSource('breweries')) {
      const source = map.getSource('breweries') as mapboxgl.GeoJSONSource;
      source.setData(createGeoJsonData());
    }

    return () => {
      if (!map.getStyle()) return;
      
      try {
        ['unclustered-point', 'unclustered-point-label', 'cluster-count', 'clusters'].forEach(layer => {
          if (map.getLayer(layer)) {
            map.removeLayer(layer);
          }
        });
        if (map.getSource('breweries')) {
          map.removeSource('breweries');
        }
        sourceAdded.current = false;
      } catch (error) {
        console.warn('Error cleaning up source:', error);
      }
    };
  }, [map, breweries]);

  return <>{children}</>;
};

export default MapSource;
