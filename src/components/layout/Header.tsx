
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import LoginPopover from '@/components/auth/LoginPopover';

const Header = () => {
  const navigate = useNavigate();
  const { user, firstName } = useAuth();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/');
    } catch (error: any) {
      toast.error('Failed to logout. Please try again.');
    }
  };

  return (
    <div className="p-4 bg-background/80 backdrop-blur-sm border-b flex justify-between items-center fixed w-full z-50">
      <h1 className="text-xl font-bold">Brewery Explorer</h1>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="text-sm text-muted-foreground">
              Welcome, {firstName || 'User'}
            </span>
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              <LayoutDashboard className="mr-2" size={18} />
              Dashboard
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </>
        ) : (
          <div className="flex gap-2">
            <LoginPopover />
            <Button onClick={() => navigate('/auth')}>Sign Up</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
