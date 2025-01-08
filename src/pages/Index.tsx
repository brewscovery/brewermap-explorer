import { useEffect, useState } from 'react';
import Map from '@/components/Map';
import Sidebar from '@/components/Sidebar';
import type { Brewery } from '@/types/brewery';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

const Index = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrewery, setSelectedBrewery] = useState<Brewery | null>(null);

  const { data: breweries = [], isLoading, error } = useQuery({
    queryKey: ['breweries'],
    queryFn: async () => {
      const types = ['micro', 'regional', 'large', 'brewpub'];
      let allBreweries: Brewery[] = [];

      // Fetch each type with a delay between requests
      for (const type of types) {
        try {
          const response = await fetch(`https://api.openbrewerydb.org/v1/breweries?by_type=${type}&per_page=50`);
          if (!response.ok) {
            throw new Error(`Failed to fetch ${type} breweries`);
          }
          const data = await response.json();
          
          // Filter out breweries with invalid coordinates
          const validBreweries = data.filter((brewery: Brewery) => {
            const lat = parseFloat(brewery.latitude);
            const lng = parseFloat(brewery.longitude);
            return !isNaN(lat) && !isNaN(lng) && 
                   lat >= -90 && lat <= 90 && 
                   lng >= -180 && lng <= 180;
          });
          
          allBreweries = [...allBreweries, ...validBreweries];
          
          // Add a delay between requests to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (err) {
          console.error(`Error fetching ${type} breweries:`, err);
          toast.error(`Failed to load ${type} breweries`);
        }
      }

      return allBreweries;
    },
    retry: 3,
    retryDelay: 1000,
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