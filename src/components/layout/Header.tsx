
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  LogOut, 
  Map, 
  User,
  ChevronDown,
  Shield
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import LoginPopover from '@/components/auth/LoginPopover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userType, firstName, lastName } = useAuth();
  const isOnDashboard = location.pathname.includes('/dashboard');
  const isOnAdmin = location.pathname.includes('/admin');
  
  // Display name based on user type
  const displayName = userType === 'business' 
    ? firstName || 'Business'
    : `${firstName || ''} ${lastName || 'User'}`.trim();

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
    <div className="p-4 bg-background/80 backdrop-blur-sm border-b flex justify-between items-center fixed w-full z-50">
      <h1 className="text-xl font-bold">Brewery Explorer</h1>
      <div className="flex items-center gap-4">
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <User size={18} />
                <span>{displayName}</span>
                <ChevronDown size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {!isOnDashboard && userType === 'business' && (
                <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                  <LayoutDashboard className="mr-2" size={18} />
                  Dashboard
                </DropdownMenuItem>
              )}
              
              {!isOnAdmin && userType === 'admin' && (
                <DropdownMenuItem onClick={() => navigate('/admin')}>
                  <Shield className="mr-2" size={18} />
                  Admin Dashboard
                </DropdownMenuItem>
              )}
              
              {(isOnDashboard || isOnAdmin) && (
                <DropdownMenuItem onClick={() => navigate('/')}>
                  <Map className="mr-2" size={18} />
                  View Map
                </DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2" size={18} />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
