import { useEffect, useState } from 'react';
import Map from '@/components/Map';
import Sidebar from '@/components/Sidebar';
import type { Brewery } from '@/types/brewery';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrewery, setSelectedBrewery] = useState<Brewery | null>(null);

  const { data: breweries = [], isLoading, error } = useQuery({
    queryKey: ['breweries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('breweries')
        .select('*');

      if (error) {
        console.error('Error fetching breweries:', error);
        throw error;
      }

      return data || [];
    },
  });

  useEffect(() => {
    if (error) {
      toast.error('Failed to load breweries');
    }
  }, [error]);

  const filteredBreweries = breweries.filter((brewery: Brewery) =>
    brewery.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brewery.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brewery.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen">
      <div className="w-96 h-full">
        <Sidebar
          breweries={filteredBreweries}
          onBrewerySelect={setSelectedBrewery}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
      </div>
      <div className="flex-1 h-full">
        <Map
          breweries={filteredBreweries}
          onBrewerySelect={setSelectedBrewery}
        />
      </div>
    </div>
  );
};

export default Index;