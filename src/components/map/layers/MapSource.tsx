
import { useEffect, useRef, useState, useCallback, createContext, useContext } from 'react';
import mapboxgl from 'mapbox-gl';
import type { Venue } from '@/types/venue';
import type { Feature, Point, FeatureCollection } from 'geojson';

interface MapSourceProps {
  map: mapboxgl.Map;
  venues: Venue[];
  children: React.ReactNode;
}

interface VenueProperties {
  id: string;
  name: string;
  brewery_id: string;
}

interface MapSourceContextType {
  isSourceReady: boolean;
}

const MapSourceContext = createContext<MapSourceContextType>({ isSourceReady: false });

export const useMapSource = () => useContext(MapSourceContext);

const MapSource = ({ map, venues, children }: MapSourceProps) => {
  const [isSourceReady, setIsSourceReady] = useState(false);
  const sourceAdded = useRef(false);
  const styleChangeCountRef = useRef(0);
  const layersRemovedRef = useRef(false);
  
  // Create GeoJSON data from venues
  const createGeoJsonData = useCallback(() => {
    const features: Feature<Point, VenueProperties>[] = venues
      .filter(venue => {
        const lng = parseFloat(venue.longitude || '');
        const lat = parseFloat(venue.latitude || '');
        return !isNaN(lng) && !isNaN(lat);
      })
      .map(venue => ({
        type: 'Feature',
        properties: {
          id: venue.id,
          name: venue.name,
          brewery_id: venue.brewery_id
        },
        geometry: {
          type: 'Point',
          coordinates: [
            parseFloat(venue.longitude || '0'),
            parseFloat(venue.latitude || '0')
          ]
        }
      }));

    console.log(`Created GeoJSON with ${features.length} features`);
    return {
      type: 'FeatureCollection',
      features: features
    } as FeatureCollection<Point, VenueProperties>;
  }, [venues]);

  // Safely remove layers first, then source
  const safelyRemoveLayers = useCallback(() => {
    if (!map.getStyle()) return;
    
    try {
      // Remove layers first
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
      
      layersRemovedRef.current = true;
      console.log('All layers removed successfully');
    } catch (error) {
      console.warn('Error removing layers:', error);
    }
  }, [map]);

  // Update the source data without recreating it
  const updateSourceData = useCallback(() => {
    try {
      if (sourceAdded.current && map.getSource('venues')) {
        const geoJsonData = createGeoJsonData();
        const source = map.getSource('venues') as mapboxgl.GeoJSONSource;
        
        if (source && source.setData) {
          console.log(`Updating existing source data with ${geoJsonData.features.length} features`);
          source.setData(geoJsonData);
        }
      }
    } catch (error) {
      console.warn('Error updating source data:', error);
    }
  }, [map, createGeoJsonData]);

  // Add source to map
  const addSource = useCallback(() => {
    if (sourceAdded.current) {
      // Just update the data if source already exists
      updateSourceData();
      return true;
    }
    
    try {
      // Verify map is ready
      if (!map.getStyle()) {
        console.log('Map style not ready, cannot add source');
        return false;
      }
      
      // First ensure all layers are removed
      safelyRemoveLayers();
      
      // Then remove source if it exists
      try {
        if (map.getSource('venues')) {
          map.removeSource('venues');
          sourceAdded.current = false;
          setIsSourceReady(false);
          console.log('Removed existing source before re-adding');
        }
      } catch (error) {
        console.log('Error checking/removing source:', error);
      }
      
      // Add new source with clustering enabled
      map.addSource('venues', {
        type: 'geojson',
        data: createGeoJsonData(),
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
        generateId: true
      });
      
      sourceAdded.current = true;
      setIsSourceReady(true);
      layersRemovedRef.current = false;
      console.log('Source added successfully, setting isSourceReady to true');
      return true;
    } catch (error) {
      console.error('Error adding source:', error);
      sourceAdded.current = false;
      setIsSourceReady(false);
      
      // Try again after a delay
      setTimeout(() => addSource(), 500);
      return false;
    }
  }, [map, createGeoJsonData, safelyRemoveLayers, updateSourceData]);

  // Initialize the source when the map is loaded
  useEffect(() => {
    if (!venues || venues.length === 0) {
      console.log('No venues to display, skipping source initialization');
      return;
    }

    const initializeSource = () => {
      if (map.isStyleLoaded() && map.getStyle()) {
        console.log('Style already loaded, initializing source');
        addSource();
      } else {
        console.log('Style not loaded, setting up load event listener');
        
        const onStyleLoad = () => {
          console.log('Style loaded event fired, initializing source');
          // Allow a brief moment for the style to fully stabilize
          setTimeout(() => {
            addSource();
          }, 200);
          map.off('style.load', onStyleLoad);
        };
        
        map.once('style.load', onStyleLoad);
      }
    };

    initializeSource();

    // Cleanup function
    return () => {
      if (!map.getStyle()) return;
      
      try {
        safelyRemoveLayers();
        
        if (map.getSource('venues')) {
          map.removeSource('venues');
        }
        sourceAdded.current = false;
        setIsSourceReady(false);
        console.log('Source removed on cleanup');
      } catch (error) {
        console.warn('Error cleaning up source:', error);
      }
    };
  }, [map, venues.length, addSource, safelyRemoveLayers]);

  // Update source data when venues change
  useEffect(() => {
    if (!venues || venues.length === 0) return;
    
    // Use a debounce mechanism to avoid too many rapid updates
    const timeoutId = setTimeout(() => {
      if (sourceAdded.current && map.getSource('venues')) {
        updateSourceData();
      } else {
        // If source doesn't exist, try to add it
        addSource();
      }
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [map, venues, updateSourceData, addSource]);

  // Handle style changes
  useEffect(() => {
    const handleStyleChange = () => {
      styleChangeCountRef.current += 1;
      console.log(`Style changed event detected (count: ${styleChangeCountRef.current})`);
      
      // Check if we need to re-add the source after a style change
      setTimeout(() => {
        try {
          if (!map.getSource('venues')) {
            console.log('Source missing after style change, re-adding');
            sourceAdded.current = false;
            layersRemovedRef.current = false;
            addSource();
          } else {
            console.log('Source still exists after style change');
            if (!isSourceReady) {
              setIsSourceReady(true);
            }
          }
        } catch (error) {
          console.warn('Error checking source after style change:', error);
          setTimeout(() => addSource(), 500);
        }
      }, 500);
    };

    map.on('styledata', handleStyleChange);
    
    return () => {
      map.off('styledata', handleStyleChange);
    };
  }, [map, addSource, isSourceReady]);

  // Provide source readiness state to child components
  return (
    <MapSourceContext.Provider value={{ isSourceReady }}>
      {children}
    </MapSourceContext.Provider>
  );
};

export default MapSource;
