
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Map from '@/components/Map';
import BreweryForm from '@/components/BreweryForm';
import { useBreweryData } from '@/hooks/useBreweryData';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import SearchBar from '@/components/search/SearchBar';
import { toast } from 'sonner';

const Index = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, userType } = useAuth();
  
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
      {userType === 'business' && (
        <div className="p-6 bg-card border-t">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Add New Brewery</h2>
            <BreweryForm onSubmitSuccess={refetch} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
