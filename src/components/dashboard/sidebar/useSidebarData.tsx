
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Brewery } from '@/types/brewery';
import { Venue } from '@/types/venue';

export const useSidebarData = (
  breweries: Brewery[],
  selectedBrewery: Brewery | null,
  setSelectedBrewery: (brewery: Brewery) => void
) => {
  const location = useLocation();
  
  // Track which brewery sections are expanded
  const [expandedBreweries, setExpandedBreweries] = useState<Record<string, boolean>>({});
  
  // Track venues per brewery to avoid excessive fetching
  const [breweryVenues, setBreweryVenues] = useState<Record<string, Venue[]>>({});
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const isVenueActive = (path: string, venueId: string) => {
    return location.pathname === path && location.search.includes(`venueId=${venueId}`);
  };
  
  const toggleBreweryExpanded = (breweryId: string) => {
    setExpandedBreweries(prev => ({
      ...prev,
      [breweryId]: !prev[breweryId]
    }));
    
    // If expanding, ensure we have venues for this brewery
    if (!expandedBreweries[breweryId]) {
      fetchVenuesForBrewery(breweryId);
    }
  };
  
  const fetchVenuesForBrewery = async (breweryId: string) => {
    if (breweryVenues[breweryId] || !breweryId) return;
    
    try {
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .eq('brewery_id', breweryId)
        .order('name');
        
      if (error) throw error;
      
      setBreweryVenues(prev => ({
        ...prev,
        [breweryId]: data as Venue[]
      }));
    } catch (error) {
      console.error('Error fetching venues:', error);
    }
  };

  // Prefetch venues for the selected brewery
  useEffect(() => {
    if (selectedBrewery?.id) {
      fetchVenuesForBrewery(selectedBrewery.id);
      
      // Auto-expand the selected brewery
      setExpandedBreweries(prev => ({
        ...prev,
        [selectedBrewery.id]: true
      }));
    }
  }, [selectedBrewery?.id]);
  
  return {
    expandedBreweries,
    breweryVenues,
    isActive,
    isVenueActive,
    toggleBreweryExpanded,
    fetchVenuesForBrewery
  };
};
