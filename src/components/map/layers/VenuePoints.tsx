
import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';

interface VenuePointsProps {
  map: mapboxgl.Map;
  source: string;
  visitedVenueIds?: string[];
}

const VenuePoints = ({ map, source, visitedVenueIds = [] }: VenuePointsProps) => {
  const layerIds = ['unclustered-point', 'unclustered-point-label'];
  const layersAdded = useRef(false);
  const [sourceReady, setSourceReady] = useState(false);
  const visitedIdsRef = useRef<string[]>([]);

  // Helper function to update point colors
  const updatePointColors = useCallback(() => {
    try {
      if (!map.getLayer('unclustered-point')) {
        console.log('Cannot update point colors - layer not found');
        return;
      }

      console.log(`Updating venue point colors with ${visitedVenueIds.length} visited venues`);
      
      map.setPaintProperty('unclustered-point', 'circle-color', [
        'case',
        ['in', ['get', 'id'], ['literal', visitedVenueIds]],
        '#22c55e', // Green color for visited venues
        '#fbbf24'  // Default yellow color for unvisited venues
      ]);

      // Store current visited IDs in ref for comparison
      visitedIdsRef.current = [...visitedVenueIds];
    } catch (error) {
      console.error('Error updating point colors:', error);
    }
  }, [map, visitedVenueIds]);

  // Check when the source is ready
  useEffect(() => {
    if (!sourceReady && map.getSource(source)) {
      console.log('Source detected as ready:', source);
      setSourceReady(true);
    }

    const checkSource = () => {
      if (map.getSource(source)) {
        console.log('Source ready event detected:', source);
        setSourceReady(true);
      }
    };

    map.on('sourcedata', checkSource);
    
    return () => {
      map.off('sourcedata', checkSource);
    };
  }, [map, source, sourceReady]);

  // Add layers when source is ready
  useEffect(() => {
    if (!sourceReady) return;
    
    const addLayers = () => {
      try {
        // Remove existing layers first (cleanup)
        layerIds.forEach(layerId => {
          if (map.getLayer(layerId)) {
            map.removeLayer(layerId);
          }
        });
        
        // Add unclustered point layer with conditional colors
        map.addLayer({
          id: 'unclustered-point',
          type: 'circle',
          source: source,
          filter: ['!', ['has', 'point_count']],
          paint: {
            'circle-color': [
              'case',
              ['in', ['get', 'id'], ['literal', visitedVenueIds]],
              '#22c55e', // Green color for visited venues
              '#fbbf24'  // Default yellow color for unvisited venues
            ],
            'circle-radius': 12,
            'circle-stroke-width': 3,
            'circle-stroke-color': '#ffffff'
          }
        });

        // Add text labels for unclustered points
        map.addLayer({
          id: 'unclustered-point-label',
          type: 'symbol',
          source: source,
          filter: ['!', ['has', 'point_count']],
          layout: {
            'text-field': ['get', 'name'],
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12,
            'text-offset': [0, 1.5],
            'text-anchor': 'top',
            'text-allow-overlap': false,
            'text-ignore-placement': false
          },
          paint: {
            'text-color': '#374151',
            'text-halo-color': '#ffffff',
            'text-halo-width': 2
          }
        });

        layersAdded.current = true;
        console.log('Point layers added successfully with', visitedVenueIds.length, 'visited venues');
        
        // Store current visited IDs in ref for comparison
        visitedIdsRef.current = [...visitedVenueIds];
      } catch (error) {
        console.error('Error adding point layers:', error);
      }
    };

    // First time adding the layers
    if (!layersAdded.current) {
      console.log('Adding point layers for the first time');
      addLayers();
    }

    return () => {
      // Cleanup on unmount (but not between renders)
      if (!map.getStyle()) return;
      
      try {
        layerIds.forEach(layerId => {
          if (map.getLayer(layerId)) {
            map.removeLayer(layerId);
          }
        });
        layersAdded.current = false;
        console.log('Point layers removed on cleanup');
      } catch (error) {
        console.warn('Error cleaning up point layers:', error);
      }
    };
  }, [map, source, sourceReady, visitedVenueIds]);

  // Update colors when visitedVenueIds changes and layers exist
  useEffect(() => {
    // Only update if:
    // 1. Layers are already added
    // 2. visitedVenueIds has actually changed (deep comparison)
    // 3. The map has the layer
    
    const idsChanged = JSON.stringify(visitedIdsRef.current) !== JSON.stringify(visitedVenueIds);
    
    if (layersAdded.current && idsChanged && map.getLayer('unclustered-point')) {
      console.log('Detected change in visited venues, updating colors');
      updatePointColors();
    }
  }, [map, visitedVenueIds, updatePointColors]);

  // If there's a style change, we need to re-add the layers
  useEffect(() => {
    const handleStyleData = () => {
      if (layersAdded.current && !map.getLayer('unclustered-point')) {
        console.log('Style changed, need to re-add point layers');
        layersAdded.current = false;
        setSourceReady(false);
      }
    };

    map.on('styledata', handleStyleData);
    
    return () => {
      map.off('styledata', handleStyleData);
    };
  }, [map]);

  return null;
};

export default VenuePoints;
