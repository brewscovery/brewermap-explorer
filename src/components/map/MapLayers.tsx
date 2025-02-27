
import React, { useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import type { Brewery } from '@/types/brewery';
import MapSource from './layers/MapSource';
import ClusterLayers from './layers/ClusterLayers';
import BreweryPoints from './layers/BreweryPoints';

interface MapLayersProps {
  map: mapboxgl.Map;
  breweries: Brewery[];
  visitedBreweryIds?: string[];
  onBrewerySelect: (brewery: Brewery) => void;
}

const MapLayers = ({ map, breweries, visitedBreweryIds, onBrewerySelect }: MapLayersProps) => {
  const [sourceAdded, setSourceAdded] = useState(false);

  useEffect(() => {
    // Add the source directly to the map
    if (!map || !map.isStyleLoaded() || !breweries.length) return;

    const createGeoJsonData = () => {
      const features = breweries
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
        features
      };
    };

    const addSource = () => {
      try {
        // Remove existing source if it exists
        if (map.getSource('breweries')) {
          map.removeSource('breweries');
        }

        // Add new source
        map.addSource('breweries', {
          type: 'geojson',
          data: createGeoJsonData(),
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 50,
          generateId: true
        });

        console.log('Source added directly to map');
        setSourceAdded(true);
      } catch (error) {
        console.error('Error adding source directly:', error);
      }
    };

    if (map.isStyleLoaded()) {
      addSource();
    } else {
      map.once('style.load', addSource);
    }

    return () => {
      if (!map.getStyle()) return;
      
      try {
        if (map.getSource('breweries')) {
          // Remove layers first
          ['unclustered-point', 'unclustered-point-label', 'cluster-count', 'clusters'].forEach(layer => {
            if (map.getLayer(layer)) {
              map.removeLayer(layer);
            }
          });
          map.removeSource('breweries');
        }
        setSourceAdded(false);
      } catch (error) {
        console.warn('Error cleaning up source:', error);
      }
    };
  }, [map, breweries]);

  return (
    <>
      {sourceAdded && (
        <>
          <ClusterLayers map={map} source="breweries" />
          <BreweryPoints map={map} source="breweries" visitedBreweryIds={visitedBreweryIds} />
        </>
      )}
    </>
  );
};

export default MapLayers;
