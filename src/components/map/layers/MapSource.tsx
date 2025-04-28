
import { useEffect, useRef, useState, useCallback, useMemo, createContext, useContext } from 'react';
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
  const [geoJsonData, setGeoJsonData] = useState<FeatureCollection<Point, VenueProperties> | null>(null);
  const sourceAdded = useRef(false);
  const addSourceAttempts = useRef(0);
  const styleChangeCountRef = useRef(0);

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

  // Update GeoJSON data when venues change
  useEffect(() => {
    console.log('Venues changed, updating GeoJSON data');
    setGeoJsonData(createGeoJsonData());
  }, [venues, createGeoJsonData]);

  // Add source to map with retry mechanism
  const addSource = useCallback(() => {
    if (!geoJsonData || sourceAdded.current || addSourceAttempts.current > 5) return false;
    
    try {
      // Verify map is ready
      if (!map.getStyle()) {
        console.log('Map style not ready, cannot add source');
        return false;
      }
      
      // Clean up existing source if it exists
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
        data: geoJsonData,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
        generateId: true
      });
      
      sourceAdded.current = true;
      setIsSourceReady(true);
      addSourceAttempts.current = 0;
      console.log('Source added successfully, setting isSourceReady to true');
      return true;
    } catch (error) {
      console.error('Error adding source:', error);
      sourceAdded.current = false;
      setIsSourceReady(false);
      addSourceAttempts.current += 1;
      
      // If we've had multiple attempts, wait longer between retries
      const retryDelay = addSourceAttempts.current > 3 ? 1000 : 300;
      
      if (addSourceAttempts.current <= 5) {
        console.log(`Will retry adding source in ${retryDelay}ms (attempt ${addSourceAttempts.current})`);
        setTimeout(() => addSource(), retryDelay);
      }
      
      return false;
    }
  }, [map, geoJsonData]);

  // Initialize the source when the map is loaded
  useEffect(() => {
    if (!geoJsonData || !venues.length) return;

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
  }, [map, venues, geoJsonData, addSource]);

  // Update source data when venues change
  useEffect(() => {
    if (!geoJsonData) return;
    
    if (sourceAdded.current) {
      try {
        const source = map.getSource('venues') as mapboxgl.GeoJSONSource;
        if (source && source.setData && typeof source.setData === 'function') {
          console.log('Updating existing source data');
          source.setData(geoJsonData);
        } else {
          console.warn('Source exists but setData method not available, re-adding source');
          sourceAdded.current = false;
          setIsSourceReady(false);
          setTimeout(addSource, 200);
        }
      } catch (error) {
        console.error('Error updating source data:', error);
        sourceAdded.current = false;
        setIsSourceReady(false);
        setTimeout(addSource, 200);
      }
    }
  }, [map, geoJsonData, addSource]);

  // Handle style changes with improved resilience
  useEffect(() => {
    let styleChangeTimeout: ReturnType<typeof setTimeout> | null = null;
    
    const handleStyleData = () => {
      // Increment style change counter
      styleChangeCountRef.current += 1;
      console.log(`Style changed event detected (count: ${styleChangeCountRef.current})`);
      
      // Debounce multiple rapid style changes
      if (styleChangeTimeout) {
        clearTimeout(styleChangeTimeout);
      }
      
      styleChangeTimeout = setTimeout(() => {
        // Check if we need to re-add the source after a style change
        try {
          if (!map.getSource('venues')) {
            console.log('Source missing after style change, re-adding');
            sourceAdded.current = false;
            
            // Wait a longer moment for map to fully stabilize
            setTimeout(() => {
              if (addSource()) {
                console.log('Source successfully re-added after style change');
              }
            }, 500);
          } else {
            console.log('Source still exists after style change');
            
            // Set isSourceReady to true to signal layers can be added
            if (!isSourceReady) {
              setIsSourceReady(true);
            }
          }
        } catch (error) {
          console.warn('Error checking source after style change:', error);
          
          // If error checking source, try re-adding after a brief delay
          setTimeout(() => {
            sourceAdded.current = false;
            addSource();
          }, 500);
        }
      }, 300);
    };

    map.on('styledata', handleStyleData);
    
    return () => {
      map.off('styledata', handleStyleData);
      if (styleChangeTimeout) {
        clearTimeout(styleChangeTimeout);
      }
    };
  }, [map, addSource, isSourceReady]);

  // Force source re-addition if we've had multiple style changes but source is still missing
  useEffect(() => {
    if (styleChangeCountRef.current > 2 && !sourceAdded.current) {
      console.log('Multiple style changes detected but source still missing - forcing source addition');
      const timer = setTimeout(() => {
        addSourceAttempts.current = 0; // Reset attempts counter
        addSource();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [addSource]);

  // Provide source readiness state to child components
  return (
    <MapSourceContext.Provider value={{ isSourceReady }}>
      {children}
    </MapSourceContext.Provider>
  );
};

export default MapSource;
