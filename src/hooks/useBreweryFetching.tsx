
import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Brewery } from '@/types/brewery';
import { toast } from 'sonner';
import { useBreweryRealtimeUpdates } from '@/hooks/useBreweryRealtimeUpdates';

export const useBreweryFetching = (userId: string | undefined) => {
  const [breweries, setBreweries] = useState<Brewery[]>([]);
  const [selectedBrewery, setSelectedBrewery] = useState<Brewery | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isUpdatingRef = useRef(false);
  
  // Setup realtime updates for breweries
  useBreweryRealtimeUpdates(selectedBrewery, setSelectedBrewery, breweries, setBreweries);
  
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
          
          setBreweries(breweriesData);
          
          if (breweriesData.length === 1) {
            setSelectedBrewery(breweriesData[0]);
          } else if (selectedBrewery === null && breweriesData.length > 0) {
            setSelectedBrewery(breweriesData[0]);
          } else if (selectedBrewery) {
            const updatedBrewery = breweriesData.find(b => b.id === selectedBrewery.id);
            if (updatedBrewery) {
              console.log('Updating selected brewery with latest data:', updatedBrewery);
              setSelectedBrewery(updatedBrewery);
            } else {
              setSelectedBrewery(breweriesData[0]);
            }
          }
        } else {
          console.log('No breweries found for this user');
          setBreweries([]);
          setSelectedBrewery(null);
        }
      } else {
        console.log('No brewery ownership records found for this user');
        setBreweries([]);
        setSelectedBrewery(null);
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

  // Initial data fetch
  useEffect(() => {
    if (userId) {
      fetchBreweries();
    }
  }, [userId]);

  return {
    breweries,
    selectedBrewery,
    isLoading,
    setSelectedBrewery,
    fetchBreweries
  };
};
