import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import type { Brewery } from '@/types/brewery';

interface MapLayersProps {
  map: mapboxgl.Map;
  breweries: Brewery[];
  onBrewerySelect: (brewery: Brewery) => void;
}

const MapLayers = ({ map, breweries, onBrewerySelect }: MapLayersProps) => {
  useEffect(() => {
    if (!map.isStyleLoaded()) {
      map.on('style.load', () => {
        addLayers();
      });
      return;
    }

    addLayers();

    function addLayers() {
      // Remove existing layers and source if they exist
      if (map.getSource('breweries')) {
        map.removeLayer('clusters');
        map.removeLayer('cluster-count');
        map.removeLayer('unclustered-point');
        map.removeSource('breweries');
      }

      // Add a source for brewery points with clustering enabled
      map.addSource('breweries', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: breweries
            .filter(brewery => brewery.longitude && brewery.latitude)
            .map(brewery => ({
              type: 'Feature',
              properties: {
                id: brewery.id,
                name: brewery.name
              },
              geometry: {
                type: 'Point',
                coordinates: [parseFloat(brewery.longitude), parseFloat(brewery.latitude)]
              }
            }))
        },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50
      });

      // Add clusters layer
      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'breweries',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#51A4DB',
            10,
            '#2B8CBE',
            30,
            '#084081'
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            20,
            10,
            30,
            30,
            40
          ]
        }
      });

      // Add cluster count layer
      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'breweries',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12
        },
        paint: {
          'text-color': '#ffffff'
        }
      });

      // Add unclustered point layer
      map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'breweries',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': '#51A4DB',
          'circle-radius': 8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff'
        }
      });
    }

    return () => {
      if (map.getSource('breweries')) {
        map.removeLayer('clusters');
        map.removeLayer('cluster-count');
        map.removeLayer('unclustered-point');
        map.removeSource('breweries');
      }
    };
  }, [map, breweries]);

  return null;
};

export default MapLayers;