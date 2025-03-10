
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Map from '@/components/Map';
import { useBreweryData } from '@/hooks/useBreweryData';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import SearchBar from '@/components/search/SearchBar';
import { toast } from 'sonner';

const Index = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  const {
    breweries,
    error,
    refetch,
    selectedBrewery,
    setSelectedBrewery,
    updateSearch
  } = useBreweryData();

  useEffect(() => {
    const type = searchParams.get('type');
    const token = searchParams.get('token');
    
    if ((type === 'recovery' || type === 'signup') && token && !user) {
      navigate('/auth' + window.location.search);
    }
  }, [navigate, searchParams, user]);

  useEffect(() => {
    if (error) {
      toast.error('Failed to load breweries');
    }
  }, [error]);

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex-1 min-h-0 pt-[73px]">
        <SearchBar onSearch={updateSearch} />
        <Map
          breweries={breweries}
          onBrewerySelect={setSelectedBrewery}
        />
      </div>
    </div>
  );
};

export default Index;

