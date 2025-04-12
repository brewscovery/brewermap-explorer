
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBreweryFetching } from '@/hooks/useBreweryFetching';
import BreweryManager from '@/components/dashboard/BreweryManager';

const Dashboard = () => {
  const { user, userType, loading } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if not a business user
  useEffect(() => {
    if (!loading && (!user || userType !== 'business')) {
      navigate('/');
    }
  }, [user, userType, loading, navigate]);

  const { 
    breweries, 
    selectedBrewery, 
    isLoading, 
    setSelectedBrewery, 
    fetchBreweries 
  } = useBreweryFetching(user?.id);

  // If still loading or no user, show loading state
  if (loading || !user) {
    return <div className="p-6 text-center">Loading dashboard...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Overview</h2>
      
      {userType === 'business' ? (
        <BreweryManager
          breweries={breweries}
          selectedBrewery={selectedBrewery}
          isLoading={isLoading}
          onBrewerySelect={setSelectedBrewery}
          onNewBreweryAdded={fetchBreweries}
        />
      ) : (
        <p className="text-muted-foreground">
          Welcome to your dashboard. User features will be added here soon.
        </p>
      )}
    </div>
  );
};

export default Dashboard;
