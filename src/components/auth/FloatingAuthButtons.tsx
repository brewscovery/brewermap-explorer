
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import LoginPopover from './LoginPopover';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { LogOut, User, Shield, LayoutDashboard, ChevronDown, Map } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const FloatingAuthButtons = () => {
  const navigate = useNavigate();
  const { user, userType, firstName, lastName } = useAuth();
  
  // Display name based on user type
  const displayName = firstName || lastName 
    ? `${firstName || ''} ${lastName || ''}`.trim()
    : userType === 'business' 
      ? 'Business'
      : userType === 'admin'
        ? 'Admin'
        : 'User';

  const handleLogout = async () => {
    try {
      // First, attempt to get the current session to check if it's valid
      const { data: sessionData } = await supabase.auth.getSession();
      
      // Only attempt to sign out if there's an active session
      if (sessionData.session) {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      }
      
      // Always clear local storage items related to auth
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('supabase.auth.refreshToken');
      
      // Always navigate and show success regardless of session state
      navigate('/');
      toast.success('Logged out successfully');
    } catch (error: any) {
      console.error('Logout error:', error);
      // Even if there's an error, force navigation to the login page
      navigate('/');
      toast.error('Error during logout, but you have been redirected home.');
    }
  };

  const isOnDashboard = location.pathname.includes('/dashboard');
  const isOnAdmin = location.pathname.includes('/admin');

  return (
    <div className="fixed z-[100] top-4 right-4 flex gap-2 animate-fade-in duration-300">
      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2 bg-white/80 backdrop-blur-sm">
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
            
            {!isOnDashboard && userType === 'regular' && (
              <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                <LayoutDashboard className="mr-2" size={18} />
                Dashboard
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
          <Button onClick={() => navigate('/auth')} variant="default" className="bg-white/80 backdrop-blur-sm hover:bg-white text-black">
            Sign Up
          </Button>
        </div>
      )}
    </div>
  );
};

export default FloatingAuthButtons;
