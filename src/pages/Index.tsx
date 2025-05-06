
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Map from '@/components/Map';
import { useVenueData } from '@/hooks/useVenueData';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { FloatingSidebarToggle } from '@/components/ui/FloatingSidebarToggle';
import FloatingSearchBar from '@/components/search/FloatingSearchBar';
import FloatingAuthButtons from '@/components/auth/FloatingAuthButtons';

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
  } = useVenueData();

  // Handle auth redirects for recovery/signup flows
  useEffect(() => {
    const type = searchParams.get('type');
    const token = searchParams.get('token');
    
    if ((type === 'recovery' || type === 'signup') && token && !user) {
      navigate('/auth' + window.location.search);
    }
  }, [navigate, searchParams, user]);

  // Handle venue data errors
  useEffect(() => {
    if (error) {
      toast.error('Failed to load venues');
    }
  }, [error]);

  // Handle venue selection
  const handleVenueSelect = (venue) => {
    console.log('Index page: Setting selected venue:', venue?.name || 'none');
    // Update the selected venue in the global state
    setSelectedVenue(venue);
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Floating UI Elements */}
      <FloatingSidebarToggle position="top-left" />
      <FloatingSearchBar onVenueSelect={handleVenueSelect} />
      <FloatingAuthButtons />
      
      <Map
        venues={venues}
        onVenueSelect={handleVenueSelect}
        selectedVenue={selectedVenue}
      />
    </div>
  );
};

export default Index;
