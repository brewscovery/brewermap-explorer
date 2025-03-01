
import React, { useEffect, useState, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import type { Brewery } from '@/types/brewery';
import type { Feature, Point, FeatureCollection } from 'geojson';
import ClusterLayers from './layers/ClusterLayers';
import BreweryPoints from './layers/BreweryPoints';
import { createBreweryFeatures } from '@/utils/mapUtils';

interface MapLayersProps {
  map: mapboxgl.Map;
  breweries: Brewery[];
  visitedBreweryIds?: string[];
  onBrewerySelect: (brewery: Brewery) => void;
}

// Define a custom interface for brewery properties
interface BreweryProperties {
  id: string;
  name: string;
}

const MapLayers = ({ map, breweries, visitedBreweryIds, onBrewerySelect }: MapLayersProps) => {
  const [sourceReady, setSourceReady] = useState(false);
  const sourceAddedRef = useRef(false);

  useEffect(() => {
    // Only proceed if map is available and we have breweries
    if (!map || !breweries.length) return;

    const createGeoJsonData = (): FeatureCollection<Point, BreweryProperties> => {
      const features = breweries
        .filter(brewery => {
          const lng = parseFloat(brewery.longitude || '');
          const lat = parseFloat(brewery.latitude || '');
          return !isNaN(lng) && !isNaN(lat);
        })
        .map(brewery => ({
          type: 'Feature' as const,
          properties: {
            id: brewery.id,
            name: brewery.name
          },
          geometry: {
            type: 'Point' as const,
            coordinates: [
              parseFloat(brewery.longitude || '0'),
              parseFloat(brewery.latitude || '0')
            ]
          }
        }));

      console.log(`Created GeoJSON with ${features.length} features`);
      return {
        type: 'FeatureCollection' as const,
        features
      };
    };

    const addOrUpdateSource = () => {
      try {
        // Check if style is loaded before attempting to add source
        if (!map.isStyleLoaded()) {
          console.log('Map style not loaded yet, waiting for style.load event');
          map.once('style.load', () => {
            setTimeout(addOrUpdateSource, 200);
          });
          return;
        }

        // Check if source already exists
        if (map.getSource('breweries')) {
          console.log('Source already exists, updating data...');
          (map.getSource('breweries') as mapboxgl.GeoJSONSource).setData(createGeoJsonData());
        } else {
          console.log('Adding new source...');
          map.addSource('breweries', {
            type: 'geojson',
            data: createGeoJsonData(),
            cluster: true,
            clusterMaxZoom: 14,
            clusterRadius: 50,
            generateId: true
          });
        }

        // Mark source as ready and notify components
        console.log('Source is ready');
        sourceAddedRef.current = true;
        setSourceReady(true);
      } catch (error) {
        console.error('Error in addOrUpdateSource:', error);
        
        // Retry after a delay if failed
        if (!sourceAddedRef.current) {
          console.log('Retrying source addition in 500ms...');
          setTimeout(addOrUpdateSource, 500);
        }
      }
    };

    addOrUpdateSource();

    return () => {
      if (!map.getStyle()) return;
      
      try {
        // Check if layers exist and remove them first
        ['unclustered-point', 'unclustered-point-label', 'cluster-count', 'clusters'].forEach(layer => {
          if (map.getLayer(layer)) {
            map.removeLayer(layer);
          }
        });
        
        // Then remove the source
        if (map.getSource('breweries')) {
          map.removeSource('breweries');
        }
        
        sourceAddedRef.current = false;
        setSourceReady(false);
      } catch (error) {
        console.warn('Error cleaning up source or layers:', error);
      }
    };
  }, [map, breweries]);

  // Only render layer components when the source is ready
  return (
    <>
      {sourceReady && (
        <>
          <ClusterLayers map={map} source="breweries" />
          <BreweryPoints map={map} source="breweries" visitedBreweryIds={visitedBreweryIds} />
        </>
      )}
    </>
  );
};

export default MapLayers;
