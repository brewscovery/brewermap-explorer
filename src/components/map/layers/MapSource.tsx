
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
  const sourceAdded = useRef(false);
  const [isSourceReady, setIsSourceReady] = useState(false);
  const [geoJsonData, setGeoJsonData] = useState<FeatureCollection<Point, VenueProperties> | null>(null);

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

  // Memoize venues to detect changes
  const venueIds = useMemo(() => {
    return new Set(venues.map(venue => venue.id));
  }, [venues]);

  // Update GeoJSON data when venues change
  useEffect(() => {
    console.log('Venues changed, updating GeoJSON data');
    setGeoJsonData(createGeoJsonData());
  }, [venues, createGeoJsonData, venueIds]);

  // Add source and layers to map
  const addSourceAndLayers = useCallback(() => {
    if (!geoJsonData || sourceAdded.current) return;
    
    console.log('Adding source and layers');
    
    try {
      // Clean up existing source if it exists
      if (map.getSource('venues')) {
        console.log('Removing existing source');
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
      console.log('Source added successfully, setting isSourceReady to true');
      setIsSourceReady(true);
    } catch (error) {
      console.error('Error adding source:', error);
      sourceAdded.current = false;
      setIsSourceReady(false);
    }
  }, [map, geoJsonData]);

  // Initialize the source when the map is loaded
  useEffect(() => {
    if (!geoJsonData) return;

    const initializeSource = () => {
      if (!map.isStyleLoaded()) {
        console.log('Style not loaded, waiting for style.load event');
        const onStyleLoad = () => {
          console.log('Style loaded, initializing source');
          addSourceAndLayers();
          map.off('style.load', onStyleLoad);
        };
        map.on('style.load', onStyleLoad);
      } else {
        console.log('Style already loaded, initializing source');
        addSourceAndLayers();
      }
    };

    if (venues.length > 0) {
      console.log(`Initializing source with ${venues.length} venues`);
      initializeSource();
    }

    // Cleanup function
    return () => {
      if (!map.getStyle()) return;
      
      console.log('Cleaning up source');
      try {
        if (map.getSource('venues')) {
          map.removeSource('venues');
        }
        sourceAdded.current = false;
        setIsSourceReady(false);
      } catch (error) {
        console.warn('Error cleaning up:', error);
      }
    };
  }, [map, venues, geoJsonData, addSourceAndLayers]);

  // Update source data when venues change and source exists
  useEffect(() => {
    if (!geoJsonData) return;
    
    if (sourceAdded.current) {
      try {
        const source = map.getSource('venues') as mapboxgl.GeoJSONSource;
        if (source) {
          console.log('Updating existing source data');
          source.setData(geoJsonData);
        }
      } catch (error) {
        console.error('Error updating source data:', error);
        // If updating fails, try to recreate the source
        sourceAdded.current = false;
        setIsSourceReady(false);
        addSourceAndLayers();
      }
    }
  }, [map, geoJsonData, addSourceAndLayers]);

  // Handle style changes which might require re-adding the source
  useEffect(() => {
    const handleStyleData = () => {
      if (!sourceAdded.current && geoJsonData) {
        console.log('Style changed, re-adding source');
        addSourceAndLayers();
      }
    };

    map.on('styledata', handleStyleData);
    
    return () => {
      map.off('styledata', handleStyleData);
    };
  }, [map, geoJsonData, addSourceAndLayers]);

  return (
    <MapSourceContext.Provider value={{ isSourceReady }}>
      {children}
    </MapSourceContext.Provider>
  );
};

export default MapSource;
