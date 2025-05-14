
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface CityResult {
  city: string;
  state?: string;
  country?: string;
  count: number;
}

export const useCitySearch = (searchTerm: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [cities, setCities] = useState<CityResult[]>([]);
  
  useEffect(() => {
    const fetchCities = async () => {
      if (!searchTerm || searchTerm.length < 2) {
        setCities([]);
        return;
      }
      
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase
          .rpc('search_cities_with_venues', {
            search_term: searchTerm.toLowerCase()
          });
        
        if (error) throw error;
        
        // Type assertion to help TypeScript understand the structure
        const cityData = data as Array<{
          city: string;
          state: string;
          country: string;
          venue_count: number;
        }>;
        
        // Format the results
        const formattedResults = cityData.map(item => ({
          city: item.city,
          state: item.state,
          country: item.country,
          count: item.venue_count
        }));
        
        setCities(formattedResults);
      } catch (error) {
        console.error('Error fetching cities:', error);
        toast({
          title: "Failed to load cities",
          description: "There was an error fetching city suggestions",
          variant: "destructive",
        });
        setCities([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Use debounce to prevent too many requests
    const handler = setTimeout(() => {
      fetchCities();
    }, 300);
    
    return () => clearTimeout(handler);
  }, [searchTerm]);
  
  return { cities, isLoading };
};
