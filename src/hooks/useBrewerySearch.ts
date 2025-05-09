
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import debounce from 'lodash/debounce';

interface Brewery {
  id: string;
  name: string;
  is_verified: boolean;
  has_owner: boolean;
  country?: string | null;
}

export function useBrewerySearch(debounceMs = 300) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Brewery[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchBreweries = async (term: string) => {
    if (!term.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Update the RPC call or create a new one that returns country information
      const { data, error } = await supabase
        .from('breweries')
        .select('id, name, is_verified, country')
        .ilike('name', `%${term}%`)
        .limit(10);

      if (error) throw error;
      
      // Process the data to include the has_owner field
      if (data) {
        // Get owner information for the breweries
        const breweryIds = data.map(brewery => brewery.id);
        const { data: ownersData } = await supabase
          .from('brewery_owners')
          .select('brewery_id')
          .in('brewery_id', breweryIds);
        
        // Create a set of brewery IDs that have owners
        const breweriesWithOwners = new Set(
          ownersData?.map(owner => owner.brewery_id) || []
        );
        
        // Map the data to include has_owner
        const breweriesWithOwnerFlag = data.map(brewery => ({
          ...brewery,
          has_owner: breweriesWithOwners.has(brewery.id)
        }));
        
        setResults(breweriesWithOwnerFlag);
      } else {
        setResults([]);
      }
    } catch (err) {
      setError('Failed to search breweries');
      console.error('Error searching breweries:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce(searchBreweries, debounceMs),
    [debounceMs]
  );

  useEffect(() => {
    debouncedSearch(searchTerm);
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerm, debouncedSearch]);

  return {
    searchTerm,
    setSearchTerm,
    results,
    isLoading,
    error
  };
}
