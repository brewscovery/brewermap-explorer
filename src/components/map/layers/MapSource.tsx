
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
        const styleLoadListener = () => {
          setupSource();
          map.off('style.load', styleLoadListener);
        };
        map.on('style.load', styleLoadListener);
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
          map.fire('source-added');
        }

        // Ensure layers are re-rendered
        if (map.loaded()) {
          map.fire('moveend');
        }
      } catch (error) {
        console.warn('Error setting up source:', error);
      }
    };

    // Wait for both map style and data
    if (map && breweries.length > 0) {
      if (map.loaded()) {
        setupSource();
      } else {
        map.once('load', setupSource);
      }
    }

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

  return <>{children}</>;
};

export default MapSource;
