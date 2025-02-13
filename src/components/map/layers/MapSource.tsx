
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

    const tryAddSource = () => {
      try {
        // Always try to remove the source first to ensure a clean state
        if (map.getSource('breweries')) {
          // If source exists, just update the data
          const source = map.getSource('breweries') as mapboxgl.GeoJSONSource;
          source.setData(createGeoJsonData());
          return;
        }

        // Add new source if it doesn't exist
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
        console.warn('Error adding/updating source:', error);
      }
    };

    // Function to check map state and add source
    const addSourceWhenReady = () => {
      if (map.isStyleLoaded()) {
        tryAddSource();
      } else {
        // Wait for style to load
        map.once('style.load', tryAddSource);
      }
    };

    // Initial attempt to add source
    addSourceWhenReady();

    // Also try adding source after a short delay to ensure map is ready
    const timer = setTimeout(() => {
      if (!sourceAdded.current) {
        addSourceWhenReady();
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      map.off('style.load', tryAddSource);
      
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

  return <>{children}</>;
};

export default MapSource;
