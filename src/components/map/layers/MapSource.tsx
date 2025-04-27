
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

  // Add source to map
  const addSource = useCallback(() => {
    if (!geoJsonData || sourceAdded.current || addSourceAttempts.current > 5) return false;
    
    try {
      // Clean up existing source if it exists
      if (map.getSource('venues')) {
        map.removeSource('venues');
        sourceAdded.current = false;
        setIsSourceReady(false);
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
      console.log('Source added successfully, setting isSourceReady to true');
      return true;
    } catch (error) {
      console.error('Error adding source:', error);
      sourceAdded.current = false;
      setIsSourceReady(false);
      addSourceAttempts.current += 1;
      return false;
    }
  }, [map, geoJsonData]);

  // Initialize the source when the map is loaded
  useEffect(() => {
    if (!geoJsonData || !venues.length) return;

    const initializeSource = () => {
      if (map.isStyleLoaded()) {
        console.log('Style already loaded, initializing source');
        console.log('Adding source and layers');
        addSource();
      } else {
        console.log('Style not loaded, setting up load event listener');
        
        const onStyleLoad = () => {
          console.log('Style loaded event fired, initializing source');
          addSource();
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
        if (source && source.setData) {
          console.log('Updating existing source data');
          source.setData(geoJsonData);
        } else {
          console.warn('Source exists but setData method not available, re-adding source');
          sourceAdded.current = false;
          setIsSourceReady(false);
          setTimeout(addSource, 100);
        }
      } catch (error) {
        console.error('Error updating source data:', error);
        sourceAdded.current = false;
        setIsSourceReady(false);
        setTimeout(addSource, 100);
      }
    }
  }, [map, geoJsonData, addSource]);

  // Handle style changes
  useEffect(() => {
    const handleStyleData = () => {
      console.log('Style changed event detected');
      
      // Check if we need to re-add the source after a style change
      try {
        if (!map.getSource('venues')) {
          console.log('Source missing after style change, re-adding');
          sourceAdded.current = false;
          setIsSourceReady(false);
          
          // Wait a short moment to ensure map is ready
          setTimeout(() => {
            if (addSource()) {
              console.log('Source successfully re-added after style change');
            }
          }, 100);
        }
      } catch (error) {
        console.warn('Error checking source after style change:', error);
      }
    };

    map.on('styledata', handleStyleData);
    
    return () => {
      map.off('styledata', handleStyleData);
    };
  }, [map, addSource]);

  // Provide source readiness state to child components
  return (
    <MapSourceContext.Provider value={{ isSourceReady }}>
      {children}
    </MapSourceContext.Provider>
  );
};

export default MapSource;
