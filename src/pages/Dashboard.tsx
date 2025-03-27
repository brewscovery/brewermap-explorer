
import { useAuth } from '@/contexts/AuthContext';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import BreweryManager from '@/components/dashboard/BreweryManager';
import { useBreweryFetching } from '@/hooks/useBreweryFetching';

const Dashboard = () => {
  const { user, userType, firstName, lastName } = useAuth();
  
  const displayName = userType === 'business' 
    ? firstName || 'Business'
    : `${firstName || ''} ${lastName || 'User'}`.trim();

  const { 
    breweries, 
    selectedBrewery, 
    isLoading, 
    setSelectedBrewery, 
    fetchBreweries 
  } = useBreweryFetching(user?.id);

  return (
    <div className="flex flex-col h-screen">
      <DashboardHeader displayName={displayName} />
      
      <div className="flex-1 pt-[73px] p-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
          
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
              Welcome to your dashboard{firstName ? `, ${firstName}` : ''}. User features will be added here soon.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
