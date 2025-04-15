
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import debounce from 'lodash/debounce';

interface Brewery {
  id: string;
  name: string;
  is_verified: boolean;
  has_owner: boolean;
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
      const { data, error } = await supabase.rpc('search_breweries', { 
        search_term: term 
      });

      if (error) throw error;
      setResults(data || []);
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
