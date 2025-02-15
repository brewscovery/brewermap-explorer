
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

    // Function to add source and trigger source-added event
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
      } catch (error) {
        console.warn('Error adding source:', error);
      }
    };

    // Function to setup or update the source
    const setupSource = () => {
      // Remove existing source and layers if they exist
      if (map.getSource('breweries')) {
        ['unclustered-point', 'unclustered-point-label', 'cluster-count', 'clusters'].forEach(layer => {
          if (map.getLayer(layer)) {
            map.removeLayer(layer);
          }
        });
        map.removeSource('breweries');
        sourceAdded.current = false;
      }
      
      // Add new source
      addSource();
    };

    // Wait for style to load before adding source
    if (!map.isStyleLoaded()) {
      map.once('style.load', setupSource);
    } else {
      setupSource();
    }

    // Update source data when breweries change
    if (sourceAdded.current) {
      const source = map.getSource('breweries') as mapboxgl.GeoJSONSource;
      if (source) {
        source.setData(createGeoJsonData());
      }
    }

    return () => {
      map.off('style.load', setupSource);
      
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
