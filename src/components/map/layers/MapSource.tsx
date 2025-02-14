
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
        map.once('style.load', setupSource);
        return;
      }

      try {
        // First try to update existing source
        const existingSource = map.getSource('breweries') as mapboxgl.GeoJSONSource;
        if (existingSource) {
          existingSource.setData(createGeoJsonData());
        } else {
          // If no source exists, add a new one
          map.addSource('breweries', {
            type: 'geojson',
            data: createGeoJsonData(),
            cluster: true,
            clusterMaxZoom: 14,
            clusterRadius: 50
          });
          sourceAdded.current = true;
          // Explicitly trigger source added event
          map.fire('source-added');
          
          // Force a map re-render
          map.once('idle', () => {
            map.fire('moveend');
          });
        }
      } catch (error) {
        console.warn('Error setting up source:', error);
      }
    };

    // Initial setup
    setupSource();

    // Also set up after a short delay to ensure map is fully ready
    const delayedSetup = setTimeout(() => {
      if (!sourceAdded.current) {
        setupSource();
      }
    }, 500);

    // Cleanup
    return () => {
      clearTimeout(delayedSetup);
      map.off('style.load', setupSource);
      
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
