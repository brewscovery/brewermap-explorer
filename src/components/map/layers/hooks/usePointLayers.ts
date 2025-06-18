import { useEffect, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import type { Venue } from '@/types/venue';

interface UsePointLayersProps {
  map: mapboxgl.Map;
  source: string;
  visitedVenueIds: string[];
  onVenueSelect?: (venue: Venue) => void;
  isSourceReady: boolean;
}

export const usePointLayers = ({ 
  map, 
  source, 
  visitedVenueIds, 
  onVenueSelect,
  isSourceReady 
}: UsePointLayersProps) => {
  const layersAdded = useRef(false);
  const iconsLoaded = useRef(false);

  // Create custom marker icons
  const createMarkerIcons = useCallback(() => {
    if (iconsLoaded.current || !map.getStyle()) return;

    try {
      // Create canvas for marker icon
      const createMarkerIcon = (color: string, iconName: string) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        canvas.width = 40;
        canvas.height = 50;

        // Draw marker shape
        ctx.fillStyle = color;
        ctx.beginPath();
        // Marker body (rounded rectangle)
        ctx.roundRect(5, 5, 30, 30, 15);
        ctx.fill();
        
        // Marker point
        ctx.beginPath();
        ctx.moveTo(20, 45);
        ctx.lineTo(15, 35);
        ctx.lineTo(25, 35);
        ctx.closePath();
        ctx.fill();

        // White border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(5, 5, 30, 30, 15);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(20, 45);
        ctx.lineTo(15, 35);
        ctx.lineTo(25, 35);
        ctx.closePath();
        ctx.stroke();

        // Draw beer mug icon
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🍺', 20, 20);

        // Convert canvas to ImageData
        return ctx.getImageData(0, 0, canvas.width, canvas.height);
      };

      // Create and add unvisited marker icon
      const unvisitedIcon = createMarkerIcon('#fbbf24', 'unvisited-marker');
      if (unvisitedIcon && !map.hasImage('unvisited-marker')) {
        map.addImage('unvisited-marker', unvisitedIcon);
      }

      // Create and add visited marker icon
      const visitedIcon = createMarkerIcon('#22c55e', 'visited-marker');
      if (visitedIcon && !map.hasImage('visited-marker')) {
        map.addImage('visited-marker', visitedIcon);
      }

      iconsLoaded.current = true;
      console.log('Custom marker icons loaded successfully');
    } catch (error) {
      console.warn('Error creating marker icons:', error);
    }
  }, [map]);

  // Update point icons without removing/re-adding layers
  const updatePointColors = useCallback(() => {
    if (!map.getLayer('unclustered-point')) return;

    try {
      console.log(`Updating venue point icons with ${visitedVenueIds.length} visited venues`);
      
      if (map && map.getStyle()) {
        map.setLayoutProperty('unclustered-point', 'icon-image', [
          'case',
          ['in', ['get', 'id'], ['literal', visitedVenueIds]],
          'visited-marker',
          'unvisited-marker'
        ]);
      }
    } catch (error) {
      console.warn('Error updating point icons:', error);
    }
  }, [map, visitedVenueIds]);

  // Safely remove layers
  const removeLayers = useCallback(() => {
    if (!map.getStyle()) return;
    
    try {
      // Remove layers in proper order
      const layers = ['unclustered-point-label', 'unclustered-point'];
      
      layers.forEach(layer => {
        if (map.getLayer(layer)) {
          map.removeLayer(layer);
          console.log(`Removed layer: ${layer}`);
        }
      });
      
      layersAdded.current = false;
    } catch (error) {
      console.warn('Error removing point layers:', error);
    }
  }, [map]);

  // Add layers only once when source is ready
  const addPointLayers = useCallback(() => {
    if (!isSourceReady) return false;

    try {
      if (!map || !map.getStyle()) return false;
      
      // Verify source exists before proceeding
      if (!map.getSource(source)) {
        console.log('Source not available, cannot add point layers');
        return false;
      }

      // Create marker icons first
      createMarkerIcons();
      
      // Check if layers already exist
      if (map.getLayer('unclustered-point')) {
        console.log('Point layers already exist');
        updatePointColors();
        layersAdded.current = true;
        return true;
      }
      
      // Add the point layer if it doesn't exist
      console.log('Adding point layers with custom markers');
      
      map.addLayer({
        id: 'unclustered-point',
        type: 'symbol',
        source: source,
        filter: ['!', ['has', 'point_count']],
        layout: {
          'icon-image': [
            'case',
            ['in', ['get', 'id'], ['literal', visitedVenueIds]],
            'visited-marker',
            'unvisited-marker'
          ],
          'icon-size': 0.8,
          'icon-allow-overlap': true,
          'icon-ignore-placement': false
        }
      });

      map.addLayer({
        id: 'unclustered-point-label',
        type: 'symbol',
        source: source,
        filter: ['!', ['has', 'point_count']],
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12,
          'text-offset': [0, 2],
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
      console.log('Point layers with custom markers added successfully');
      return true;
    } catch (error) {
      console.error('Error adding point layers:', error);
      layersAdded.current = false;
      return false;
    }
  }, [map, source, isSourceReady, visitedVenueIds, updatePointColors, createMarkerIcons]);

  // Initial layer setup - only adds layers if they don't exist
  useEffect(() => {
    if (!isSourceReady || !map.getStyle()) return;

    // Try to add point layers if not already added
    // Use a small delay to ensure source is fully initialized
    const timer = setTimeout(() => {
      // Only try to add point layers if the source exists
      if (map.getSource(source) && !layersAdded.current) {
        console.log('Source exists, adding point layers');
        addPointLayers();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [map, source, isSourceReady, addPointLayers]);

  // Update colors whenever visited venues change
  useEffect(() => {
    if (isSourceReady && map.getLayer('unclustered-point')) {
      updatePointColors();
    }
  }, [map, visitedVenueIds, updatePointColors, isSourceReady]);

  // Handle style changes
  useEffect(() => {
    const handleStyleChange = () => {
      if (isSourceReady && map.getSource(source) && !map.getLayer('unclustered-point')) {
        // Reset icons loaded flag when style changes
        iconsLoaded.current = false;
        // Layers missing but source exists, try to re-add the layers
        console.log('Style changed, layers missing. Re-adding point layers...');
        setTimeout(() => {
          addPointLayers();
        }, 50);
      }
    };

    map.on('styledata', handleStyleChange);
    
    return () => {
      map.off('styledata', handleStyleChange);
    };
  }, [map, source, isSourceReady, addPointLayers]);

  // Clean up when component unmounts or source changes
  useEffect(() => {
    return () => {
      layersAdded.current = false;
      iconsLoaded.current = false;
    };
  }, [source]);

  return {
    layersAdded: layersAdded.current,
    updatePointColors,
    addPointLayers,
    removeLayers
  };
};
