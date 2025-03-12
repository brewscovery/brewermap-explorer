
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Map, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import BreweryInfo from '@/components/brewery/BreweryInfo';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, userType, firstName } = useAuth();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/');
      toast.success('Logged out successfully');
    } catch (error: any) {
      toast.error('Failed to logout. Please try again.');
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="p-4 bg-background/80 backdrop-blur-sm border-b flex justify-between items-center fixed w-full z-50">
        <h1 className="text-xl font-bold">Brewery Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Welcome, {firstName || 'User'}
          </span>
          <Button variant="outline" onClick={() => navigate('/')}>
            <Map className="mr-2" size={18} />
            View Map
          </Button>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2" size={18} />
            Logout
          </Button>
        </div>
      </div>
      <div className="flex-1 pt-[73px] p-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
          
          {userType === 'business' ? (
            <div className="space-y-8">
              <BreweryInfo />
              
              <div className="border-t pt-6">
                <p className="text-muted-foreground">
                  More brewery management features coming soon.
                </p>
              </div>
            </div>
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
