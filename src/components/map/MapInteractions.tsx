import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import type { Brewery } from '@/types/brewery';

interface MapInteractionsProps {
  map: mapboxgl.Map;
  breweries: Brewery[];
  onBrewerySelect: (brewery: Brewery) => void;
}

const MapInteractions = ({ map, breweries, onBrewerySelect }: MapInteractionsProps) => {
  useEffect(() => {
    if (!map) return;

    // Handle clicks on clusters
    const handleClusterClick = (e: mapboxgl.MapMouseEvent) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['clusters']
      });
      
      if (!features.length) return;

      const clusterId = features[0].properties?.cluster_id;
      const source = map.getSource('breweries') as mapboxgl.GeoJSONSource;
      
      if (!source) {
        console.error('Source not found');
        return;
      }

      source.getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) return;

        if (!features[0].geometry || features[0].geometry.type !== 'Point') return;

        map.easeTo({
          center: [
            features[0].geometry.coordinates[0],
            features[0].geometry.coordinates[1]
          ],
          zoom: zoom
        });
      });
    };

    // Handle clicks on individual points
    const handlePointClick = (e: mapboxgl.MapMouseEvent) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['unclustered-point']
      });

      if (!features.length || !features[0].properties) return;
      
      const properties = features[0].properties;
      const brewery = breweries.find(b => b.id === properties.id);
      
      if (!brewery || !features[0].geometry || features[0].geometry.type !== 'Point') return;

      const coordinates = features[0].geometry.coordinates.slice() as [number, number];

      // Create popup content
      const popupHTML = `
        <h3 class="font-bold">${brewery.name}</h3>
        <p class="text-sm">${brewery.street || ''}</p>
        <p class="text-sm">${brewery.city}, ${brewery.state}</p>
        ${brewery.website_url ? `<a href="${brewery.website_url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline text-sm">Visit Website</a>` : ''}
      `;

      new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(popupHTML)
        .addTo(map);

      // Create a clean brewery object with only primitive values
      const selectedBrewery: Brewery = {
        id: brewery.id,
        name: brewery.name,
        brewery_type: brewery.brewery_type || '',
        street: brewery.street || '',
        city: brewery.city,
        state: brewery.state,
        postal_code: brewery.postal_code || '',
        country: brewery.country || 'United States',
        longitude: String(coordinates[0]),
        latitude: String(coordinates[1]),
        phone: brewery.phone || '',
        website_url: brewery.website_url || ''
      };

      onBrewerySelect(selectedBrewery);
    };

    // Add event listeners
    map.on('click', 'clusters', handleClusterClick);
    map.on('click', 'unclustered-point', handlePointClick);
    map.on('mouseenter', 'clusters', () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', 'clusters', () => { map.getCanvas().style.cursor = ''; });
    map.on('mouseenter', 'unclustered-point', () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', 'unclustered-point', () => { map.getCanvas().style.cursor = ''; });

    // Cleanup
    return () => {
      if (!map.getStyle()) return;
      
      map.off('click', 'clusters', handleClusterClick);
      map.off('click', 'unclustered-point', handlePointClick);
      map.off('mouseenter', 'clusters', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.off('mouseleave', 'clusters', () => { map.getCanvas().style.cursor = ''; });
      map.off('mouseenter', 'unclustered-point', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.off('mouseleave', 'unclustered-point', () => { map.getCanvas().style.cursor = ''; });
    };
  }, [map, breweries, onBrewerySelect]);

  return null;
};

export default MapInteractions;