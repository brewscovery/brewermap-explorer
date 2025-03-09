
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Map } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, userType, firstName } = useAuth();

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
        </div>
      </div>
      <div className="flex-1 pt-[73px] p-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome to your brewery dashboard{firstName ? `, ${firstName}` : ''}. Future functionality will be added here.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
