
import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Brewery } from '@/types/brewery';
import { toast } from 'sonner';
import { useRealtimeBrewery } from '@/hooks/useRealtimeBrewery';

// Create a persistent reference that survives across component remounts
// This will store the last selected brewery ID across page navigations
const lastSelectedBreweryIdRef = { current: null };

export const useBreweryFetching = (userId: string | undefined) => {
  const [breweries, setBreweries] = useState<Brewery[]>([]);
  const [selectedBrewery, setSelectedBrewery] = useState<Brewery | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isUpdatingRef = useRef(false);

  // Setup realtime updates for the selected brewery using the new consolidated system
  useRealtimeBrewery(
    selectedBrewery?.id || null,
    (updatedBrewery) => {
      // Update the selected brewery with real-time data
      setSelectedBrewery(updatedBrewery);
      
      // Also update the brewery in the breweries array
      setBreweries(prevBreweries => 
        prevBreweries.map(brewery => 
          brewery.id === updatedBrewery.id ? updatedBrewery : brewery
        )
      );
    }
  );
  
  // Local ref to track the current brewery ID within this component instance
  const currentBreweryIdRef = useRef<string | null>(selectedBrewery?.id || lastSelectedBreweryIdRef.current);
  
  const fetchBreweries = async () => {
    if (!userId || isUpdatingRef.current) return;
    
    try {
      isUpdatingRef.current = true;
      setIsLoading(true);
      console.log('Fetching breweries for user:', userId);
      
      const { data: ownerData, error: ownerError } = await supabase
        .from('brewery_owners')
        .select('brewery_id')
        .eq('user_id', userId);
      
      if (ownerError) throw ownerError;
      
      if (ownerData && ownerData.length > 0) {
        const breweryIds = ownerData.map(item => item.brewery_id);
        console.log('Found brewery IDs:', breweryIds);
        
        const { data: breweriesData, error: breweriesError } = await supabase
          .from('breweries')
          .select('*')
          .in('id', breweryIds);
          
        if (breweriesError) throw breweriesError;
        
        if (breweriesData && breweriesData.length > 0) {
          console.log('Fetched brewery data:', breweriesData);
          
          // Type assertion to make TypeScript happy
          const typedBreweries = breweriesData as Brewery[];
          setBreweries(typedBreweries);
          
          // Check for previously selected brewery (either from this session or persisted)
          const persistedBreweryId = lastSelectedBreweryIdRef.current || currentBreweryIdRef.current;
          
          if (persistedBreweryId) {
            console.log('Looking for previously selected brewery ID:', persistedBreweryId);
            const previouslySelected = typedBreweries.find(b => b.id === persistedBreweryId);
            
            if (previouslySelected) {
              console.log('Restoring previously selected brewery:', previouslySelected.name);
              setSelectedBrewery(previouslySelected);
              currentBreweryIdRef.current = previouslySelected.id;
              lastSelectedBreweryIdRef.current = previouslySelected.id;
              return;
            } else {
              console.log('Previously selected brewery not found in current brewery list');
            }
          }
          
          // For first time loading with no previous selection
          if (selectedBrewery === null) {
            console.log('No prior selection, defaulting to first brewery:', typedBreweries[0].name);
            setSelectedBrewery(typedBreweries[0]);
            currentBreweryIdRef.current = typedBreweries[0].id;
            lastSelectedBreweryIdRef.current = typedBreweries[0].id;
          }
        } else {
          console.log('No breweries found for this user');
          setBreweries([]);
          setSelectedBrewery(null);
          currentBreweryIdRef.current = null;
          lastSelectedBreweryIdRef.current = null;
        }
      } else {
        console.log('No brewery ownership records found for this user');
        setBreweries([]);
        setSelectedBrewery(null);
        currentBreweryIdRef.current = null;
        lastSelectedBreweryIdRef.current = null;
      }
    } catch (error) {
      console.error('Error fetching breweries:', error);
      toast.error('Failed to load breweries');
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 500);
    }
  };

  // Set up subscription to brewery_owners table
  useEffect(() => {
    if (!userId) return;

    fetchBreweries();
    
    console.log('Setting up subscription to brewery_owners table');
    const ownershipChannel = supabase
      .channel('brewery-ownership-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'brewery_owners',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('Brewery ownership change detected:', payload);
          if (!isUpdatingRef.current) {
            fetchBreweries();
          }
        }
      )
      .subscribe();
      
    return () => {
      console.log('Cleaning up brewery_owners subscription');
      supabase.removeChannel(ownershipChannel);
    };
  }, [userId]);

  // Custom setter for selectedBrewery that also updates both refs
  const setSelectedBreweryWithRef = (brewery: Brewery | null) => {
    console.log('Setting selected brewery to:', brewery?.name);
    setSelectedBrewery(brewery);
    
    // Update both the component-level ref and the module-level persistent ref
    currentBreweryIdRef.current = brewery?.id || null;
    lastSelectedBreweryIdRef.current = brewery?.id || null;
  };

  return {
    breweries,
    selectedBrewery,
    isLoading,
    setSelectedBrewery: setSelectedBreweryWithRef,
    fetchBreweries
  };
};
