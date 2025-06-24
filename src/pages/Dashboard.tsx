
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBreweryFetching } from '@/hooks/useBreweryFetching';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import UnifiedBreweryForm from '@/components/brewery/UnifiedBreweryForm';
import { toast } from 'sonner';
import { useBreweryClaimNotifications } from '@/hooks/useBreweryClaimNotifications';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useRealtimeUser } from '@/hooks/useRealtimeUser';
import { useRealtimeBusinessUser } from '@/hooks/useRealtimeBusinessUser';
import DeleteBreweryDialog from '@/components/brewery/DeleteBreweryDialog';
import RegularDashboard from '@/pages/dashboard/RegularDashboard';

const Dashboard = () => {
  const { user, userType, loading } = useAuth();
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  useRealtimeUser();
  useRealtimeBusinessUser();
  
  // Redirect if not authenticated at all
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    } 
  }, [user, loading, navigate]);

  const { 
    selectedBrewery,
    isLoading,
    fetchBreweries 
  } = useBreweryFetching(user?.id);

  // Log when the selected brewery changes
  useEffect(() => {
    console.log("Dashboard - selectedBrewery updated:", selectedBrewery?.name);
  }, [selectedBrewery]);

  // Add the notifications hook for business users
  useBreweryClaimNotifications();

  // If still loading or no user, show loading state
  if (loading || !user) {
    return <div className="p-6 text-center">Loading dashboard...</div>;
  }

  // Handle regular users - show their dashboard
  if (userType === 'regular') {
    return <RegularDashboard />;
  }

  // Handle business users - show brewery management
  if (userType === 'business') {
    const handleSubmitSuccess = async () => {
      await fetchBreweries();
      toast.success("Brewery updated successfully");
    };

    const handleDeleteSuccess = () => {
      navigate('/');
      toast.success("You've been redirected to the home page");
    };

    if (!selectedBrewery) {
      return (
        <div className="pt-6">
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
      <div className="max-w-4xl mx-auto pt-6">
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
              onSubmitSuccess={handleSubmitSuccess}
              isAdminMode={false}
              breweryId={selectedBrewery.id}
              isEditMode={true}
            />
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-6">
            <div></div>
            <Button 
              variant="destructive" 
              onClick={() => setIsDeleteDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <Trash2 size={16} />
              Delete Brewery
            </Button>
          </CardFooter>
        </Card>

        <DeleteBreweryDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          breweryId={selectedBrewery?.id || null}
          breweryName={selectedBrewery?.name || ""}
          onSuccess={handleDeleteSuccess}
        />
      </div>
    );
  }

  // Fallback for unknown user types
  return (
    <div className="pt-6">
      <Card>
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
          <CardDescription>
            Welcome to your dashboard
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
};

export default Dashboard;
