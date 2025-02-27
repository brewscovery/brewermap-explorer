
import { useEffect, useRef, useState } from 'react';
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
  const [sourceReady, setSourceReady] = useState(false);

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
      if (!map.getStyle()) {
        console.error('Cannot add source: Map has no style');
        return;
      }
      
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
        setSourceReady(true);
        console.log('Source added successfully');
      } catch (error) {
        console.error('Error adding source and layers:', error);
        
        // Retry once more after a delay if failed
        setTimeout(() => {
          try {
            if (map.getStyle() && !map.getSource('breweries') && map.isStyleLoaded()) {
              console.log('Retrying to add source after error');
              
              map.addSource('breweries', {
                type: 'geojson',
                data: createGeoJsonData(),
                cluster: true,
                clusterMaxZoom: 14,
                clusterRadius: 50,
                generateId: true
              });
              
              sourceAdded.current = true;
              setSourceReady(true);
              console.log('Source added successfully on retry');
            }
          } catch (retryError) {
            console.error('Failed to add source on retry:', retryError);
          }
        }, 500);
      }
    };

    const initializeSource = () => {
      // First, check if style exists and is loaded
      if (!map.getStyle()) {
        console.error('Cannot initialize source: Map has no style');
        return;
      }
      
      if (!map.isStyleLoaded()) {
        console.log('Style not loaded, waiting for style.load event');
        
        // One-time listener to add source after style loads
        const onStyleLoad = () => {
          console.log('Style loaded event received, initializing source');
          
          // Small delay to ensure style is fully processed
          setTimeout(() => {
            if (map.getStyle() && map.isStyleLoaded()) {
              console.log('Style confirmed loaded, adding source');
              addSourceAndLayers();
            } else {
              console.warn('Style still not properly loaded after style.load event');
              
              // Final retry with longer delay
              setTimeout(() => {
                if (map.getStyle() && map.isStyleLoaded()) {
                  console.log('Last attempt to add source');
                  addSourceAndLayers();
                }
              }, 1000);
            }
          }, 200);
          
          // Remove this listener to avoid multiple initializations
          map.off('style.load', onStyleLoad);
        };
        
        map.on('style.load', onStyleLoad);
        
        // Also check again after a delay (backup if event doesn't fire)
        setTimeout(() => {
          if (!sourceAdded.current && map.getStyle() && map.isStyleLoaded()) {
            console.log('Adding source via timeout check');
            map.off('style.load', onStyleLoad); // Remove listener to avoid duplicates
            addSourceAndLayers();
          }
        }, 2000);
      } else {
        console.log('Style already loaded, initializing source immediately');
        addSourceAndLayers();
      }
    };

    // Initialize source when component mounts or breweries change
    if (breweries.length > 0 && map) {
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
        if (map.isStyleLoaded() && map.getStyle()) {
          setTimeout(() => addSourceAndLayers(), 100);
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
        setSourceReady(false);
      } catch (error) {
        console.warn('Error cleaning up:', error);
      }
    };
  }, [map, breweries]);

  // Only render children when source is ready
  return <>{sourceReady ? children : null}</>;
};

export default MapSource;
