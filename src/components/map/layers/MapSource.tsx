
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

      console.log(`Created GeoJSON with ${features.length} features`);
      return {
        type: 'FeatureCollection',
        features: features
      } as FeatureCollection<Point, BreweryProperties>;
    };

    const addSourceAndLayers = () => {
      console.log('Adding source and layers');
      
      try {
        // Clean up existing source and layers if they exist
        ['unclustered-point', 'unclustered-point-label', 'cluster-count', 'clusters'].forEach(layer => {
          if (map.getLayer(layer)) {
            map.removeLayer(layer);
          }
        });
        
        if (map.getSource('breweries')) {
          map.removeSource('breweries');
        }
        
        // Add new source with clustering enabled
        map.addSource('breweries', {
          type: 'geojson',
          data: createGeoJsonData(),
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 50,
          generateId: true // Ensures unique IDs for features
        });
        
        sourceAdded.current = true;
        console.log('Source added successfully');
      } catch (error) {
        console.error('Error adding source and layers:', error);
      }
    };

    const initializeSource = () => {
      if (!map.isStyleLoaded()) {
        console.log('Style not loaded, waiting for style.load event');
        
        // One-time listener to add source after style loads
        const onStyleLoad = () => {
          console.log('Style loaded, initializing source');
          // Small delay to ensure style is fully processed
          setTimeout(() => {
            if (map.isStyleLoaded()) {
              addSourceAndLayers();
            } else {
              console.warn('Style still not loaded after style.load event');
            }
          }, 100);
          
          map.off('style.load', onStyleLoad);
        };
        
        map.on('style.load', onStyleLoad);
      } else {
        console.log('Style already loaded, initializing source');
        addSourceAndLayers();
      }
    };

    // Initialize source when component mounts or breweries change
    if (breweries.length > 0) {
      console.log(`Initializing source with ${breweries.length} breweries`);
      initializeSource();
    }

    // Update source data when breweries change and source exists
    if (sourceAdded.current && map.getSource('breweries')) {
      try {
        const source = map.getSource('breweries') as mapboxgl.GeoJSONSource;
        if (source) {
          console.log('Updating existing source data');
          source.setData(createGeoJsonData());
        }
      } catch (error) {
        console.error('Error updating source data:', error);
        // If updating fails, try to re-add the source
        if (map.isStyleLoaded()) {
          addSourceAndLayers();
        }
      }
    }

    return () => {
      if (!map.getStyle()) return;
      
      console.log('Cleaning up source and layers');
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
        console.warn('Error cleaning up:', error);
      }
    };
  }, [map, breweries]);

  return <>{children}</>;
};

export default MapSource;
