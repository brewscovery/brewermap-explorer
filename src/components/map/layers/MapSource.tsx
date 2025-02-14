
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
  const retryCount = useRef(0);
  const MAX_RETRIES = 5;

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

    const updateSource = () => {
      try {
        const source = map.getSource('breweries') as mapboxgl.GeoJSONSource;
        if (source) {
          source.setData(createGeoJsonData());
          return true;
        }
        return false;
      } catch (error) {
        console.warn('Error updating source:', error);
        return false;
      }
    };

    const addSource = () => {
      try {
        map.addSource('breweries', {
          type: 'geojson',
          data: createGeoJsonData(),
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 50
        });
        sourceAdded.current = true;
        map.fire('source-added');
        return true;
      } catch (error) {
        console.warn('Error adding source:', error);
        return false;
      }
    };

    const initializeSource = () => {
      if (!map.isStyleLoaded()) {
        if (retryCount.current < MAX_RETRIES) {
          retryCount.current++;
          setTimeout(initializeSource, 200);
        }
        return;
      }

      // Try to update existing source first
      if (!updateSource()) {
        // If update fails, try to add new source
        if (!map.getSource('breweries')) {
          addSource();
        }
      }
    };

    // Start initialization process
    initializeSource();

    // Cleanup
    return () => {
      if (!map.getStyle()) return;
      
      try {
        if (map.getSource('breweries')) {
          map.removeSource('breweries');
          sourceAdded.current = false;
        }
      } catch (error) {
        console.warn('Error cleaning up source:', error);
      }
    };
  }, [map, breweries]);

  // Reset retry count when map changes
  useEffect(() => {
    retryCount.current = 0;
  }, [map]);

  return <>{children}</>;
};

export default MapSource;
