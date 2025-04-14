import { useState, useEffect, useCallback } from 'react';
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
  
  // Enhanced isActive function that checks path more precisely
  const isActive = useCallback((path: string) => {
    // Root dashboard case
    if (path === '/dashboard' && location.pathname === '/dashboard') {
      return true;
    }
    
    // Exact match for other routes
    return location.pathname === path;
  }, [location.pathname]);
  
  // Enhanced isVenueActive function that checks both path and venue ID
  const isVenueActive = useCallback((path: string, venueId: string) => {
    const searchParams = new URLSearchParams(location.search);
    const currentVenueId = searchParams.get('venueId');
    
    console.log('Venue Active Check:', {
      path,
      venueId,
      currentVenueId,
      locationPathname: location.pathname,
      locationSearch: location.search
    });
    
    return location.pathname === path && currentVenueId === venueId;
  }, [location.pathname, location.search]);
  
  const fetchVenuesForBrewery = useCallback(async (breweryId: string) => {
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
  }, [breweryVenues]);

  // Fixed toggle function to avoid the double state update issue
  const toggleBreweryExpanded = useCallback((breweryId: string) => {
    // Single state update with both toggle and venue fetching
    setExpandedBreweries(prev => {
      const newExpanded = !prev[breweryId];
      
      // If we're expanding, ensure we fetch venues for this brewery
      if (newExpanded) {
        // Use setTimeout to avoid React's batched updates preventing the fetch
        setTimeout(() => {
          fetchVenuesForBrewery(breweryId);
        }, 0);
      }
      
      // Return the new state
      return {
        ...prev,
        [breweryId]: newExpanded
      };
    });
  }, [fetchVenuesForBrewery]);

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
  }, [selectedBrewery?.id, fetchVenuesForBrewery]);
  
  return {
    expandedBreweries,
    breweryVenues,
    isActive,
    isVenueActive,
    toggleBreweryExpanded,
    fetchVenuesForBrewery
  };
};
