import { useEffect, useState } from 'react';
import Map from '@/components/Map';
import Sidebar from '@/components/Sidebar';
import BreweryForm from '@/components/BreweryForm';
import type { Brewery } from '@/types/brewery';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'name' | 'city' | 'country'>('name');
  const [selectedBrewery, setSelectedBrewery] = useState<Brewery | null>(null);
  const [displayedBreweries, setDisplayedBreweries] = useState<Brewery[]>([]);

  const { data: breweries = [], isLoading, error, refetch } = useQuery({
    queryKey: ['breweries', searchTerm, searchType],
    queryFn: async () => {
      if (!searchTerm) {
        const { data, error } = await supabase
          .from('breweries')
          .select('*');

        if (error) throw error;
        return data || [];
      }

      if (searchType === 'city') {
        const { data, error } = await supabase.functions.invoke('geocode-city', {
          body: { city: searchTerm }
        });

        if (error) throw error;
        return data || [];
      }

      const { data, error } = await supabase
        .from('breweries')
        .select('*')
        .filter(
          searchType === 'name' 
            ? 'name' 
            : 'country',
          'ilike',
          `%${searchTerm}%`
        );

      if (error) throw error;
      return data || [];
    },
  });

  useEffect(() => {
    if (error) {
      toast.error('Failed to load breweries');
    }
  }, [error]);

  // Update displayed breweries when selection changes
  useEffect(() => {
    if (selectedBrewery) {
      setDisplayedBreweries([selectedBrewery, ...breweries.filter(b => b.id !== selectedBrewery.id)]);
    } else {
      setDisplayedBreweries(breweries);
    }
  }, [selectedBrewery, breweries]);

  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-1 min-h-0">
        <div className="w-96 h-full">
          <Sidebar
            breweries={breweries}
            onBrewerySelect={setSelectedBrewery}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchType={searchType}
            onSearchTypeChange={setSearchType}
          />
        </div>
        <div className="flex-1 h-full">
          <Map
            breweries={displayedBreweries}
            onBrewerySelect={setSelectedBrewery}
          />
        </div>
      </div>
      <div className="p-6 bg-card border-t">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Add New Brewery</h2>
          <BreweryForm onSubmitSuccess={refetch} />
        </div>
      </div>
    </div>
  );
};

export default Index;