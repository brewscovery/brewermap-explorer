
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBreweryFetching } from '@/hooks/useBreweryFetching';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import UnifiedBreweryForm from '@/components/brewery/UnifiedBreweryForm';

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
    selectedBrewery,
    isLoading,
    fetchBreweries 
  } = useBreweryFetching(user?.id);

  // If still loading or no user, show loading state
  if (loading || !user) {
    return <div className="p-6 text-center">Loading dashboard...</div>;
  }

  if (!selectedBrewery) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>No Brewery Selected</CardTitle>
            <CardDescription>
              Please select a brewery from the sidebar or create a new one to get started.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Brewery Details</CardTitle>
          <CardDescription>
            Update your brewery's information below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UnifiedBreweryForm
            initialData={selectedBrewery}
            onSubmit={() => {}}
            onSubmitSuccess={fetchBreweries}
            isAdminMode={false}
            breweryId={selectedBrewery.id}
            isEditMode={true}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
