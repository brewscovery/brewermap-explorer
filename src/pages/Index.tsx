
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Map from '@/components/Map';
import { useVenueData } from '@/hooks/useVenueData';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import { toast } from 'sonner';

const Index = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  const {
    venues,
    error,
    refetch,
    selectedVenue,
    setSelectedVenue,
    updateSearch
  } = useVenueData();

  useEffect(() => {
    const type = searchParams.get('type');
    const token = searchParams.get('token');
    
    if ((type === 'recovery' || type === 'signup') && token && !user) {
      navigate('/auth' + window.location.search);
    }
  }, [navigate, searchParams, user]);

  useEffect(() => {
    if (error) {
      toast.error('Failed to load venues');
    }
  }, [error]);

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex-1 min-h-0 pt-[73px]">
        <Map
          venues={venues}
          onVenueSelect={setSelectedVenue}
        />
      </div>
    </div>
  );
};

export default Index;
