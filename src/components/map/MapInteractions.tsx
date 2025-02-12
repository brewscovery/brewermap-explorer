
import { useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import type { Brewery } from '@/types/brewery';
import { CheckInDialog } from '@/components/CheckInDialog';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface MapInteractionsProps {
  map: mapboxgl.Map;
  breweries: Brewery[];
  onBrewerySelect: (brewery: Brewery) => void;
}

interface CheckIn {
  rating: number;
  comment: string;
  created_at: string;
}

const MapInteractions = ({ map, breweries, onBrewerySelect }: MapInteractionsProps) => {
  const [selectedBrewery, setSelectedBrewery] = useState<Brewery | null>(null);
  const [isCheckInDialogOpen, setIsCheckInDialogOpen] = useState(false);
  const { user, userType } = useAuth();

  // Fetch user's check-ins for the selected brewery
  const { data: userCheckins } = useQuery({
    queryKey: ['brewery-checkins', selectedBrewery?.id, user?.id],
    queryFn: async () => {
      if (!user || !selectedBrewery) return null;
      const { data, error } = await supabase
        .from('checkins')
        .select('rating, comment, created_at')
        .eq('brewery_id', selectedBrewery.id)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user && !!selectedBrewery
  });

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
      
      if (!source) return;

      source.getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) return;

        if (!features[0].geometry || features[0].geometry.type !== 'Point') return;

        const coordinates = features[0].geometry.coordinates as [number, number];
        
        map.easeTo({
          center: coordinates,
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

      const coordinates = features[0].geometry.coordinates as [number, number];

      // Create popup content with user's check-ins if available
      let checkinsHtml = '';
      if (user && userCheckins && userCheckins.length > 0) {
        checkinsHtml = `
          <div class="mt-4 border-t pt-2">
            <h4 class="font-semibold mb-2">Your Check-ins</h4>
            ${userCheckins.map((checkin: CheckIn) => `
              <div class="mb-2 pb-2 border-b last:border-b-0">
                <p class="text-sm font-medium">Rating: ${'⭐'.repeat(checkin.rating)}</p>
                ${checkin.comment ? `<p class="text-sm">${checkin.comment}</p>` : ''}
                <p class="text-xs text-gray-500">${new Date(checkin.created_at).toLocaleDateString()}</p>
              </div>
            `).join('')}
          </div>
        `;
      }

      // Create popup content
      const popupHTML = `
        <div class="space-y-2">
          <h3 class="font-bold">${brewery.name}</h3>
          <p class="text-sm">${brewery.street || ''}</p>
          <p class="text-sm">${brewery.city}, ${brewery.state}</p>
          ${brewery.website_url ? `<a href="${brewery.website_url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline text-sm">Visit Website</a>` : ''}
          ${user && userType === 'regular' ? '<button class="check-in-btn bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 rounded-md text-sm font-medium">Check In</button>' : ''}
          ${checkinsHtml}
        </div>
      `;

      const popup = new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(popupHTML)
        .addTo(map);

      // Add click handler for check-in button
      const checkInBtn = popup.getElement().querySelector('.check-in-btn');
      if (checkInBtn) {
        checkInBtn.addEventListener('click', () => {
          if (!user) {
            toast.error('Please log in to check in at breweries');
            return;
          }
          setSelectedBrewery(brewery);
          setIsCheckInDialogOpen(true);
          popup.remove();
        });
      }

      onBrewerySelect(brewery);
      setSelectedBrewery(brewery);
    };

    // Add cursor change handlers
    const handleMouseEnter = () => map.getCanvas().style.cursor = 'pointer';
    const handleMouseLeave = () => map.getCanvas().style.cursor = '';

    // Add event listeners
    map.on('click', 'clusters', handleClusterClick);
    map.on('click', 'unclustered-point', handlePointClick);
    map.on('mouseenter', 'clusters', handleMouseEnter);
    map.on('mouseleave', 'clusters', handleMouseLeave);
    map.on('mouseenter', 'unclustered-point', handleMouseEnter);
    map.on('mouseleave', 'unclustered-point', handleMouseLeave);

    // Cleanup
    return () => {
      if (!map.getStyle()) return;
      
      map.off('click', 'clusters', handleClusterClick);
      map.off('click', 'unclustered-point', handlePointClick);
      map.off('mouseenter', 'clusters', handleMouseEnter);
      map.off('mouseleave', 'clusters', handleMouseLeave);
      map.off('mouseenter', 'unclustered-point', handleMouseEnter);
      map.off('mouseleave', 'unclustered-point', handleMouseLeave);
    };
  }, [map, breweries, onBrewerySelect, user, userType, userCheckins]);

  return (
    <>
      {selectedBrewery && (
        <CheckInDialog
          brewery={selectedBrewery}
          isOpen={isCheckInDialogOpen}
          onClose={() => {
            setIsCheckInDialogOpen(false);
            setSelectedBrewery(null);
          }}
          onSuccess={() => {
            // Handle successful check-in
          }}
        />
      )}
    </>
  );
};

export default MapInteractions;
