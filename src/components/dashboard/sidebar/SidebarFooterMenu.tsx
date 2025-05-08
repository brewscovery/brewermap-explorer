
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarFooter,
  useSidebar
} from '@/components/ui/sidebar';
import { Map, User, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const SidebarFooterMenu: React.FC = () => {
  const navigate = useNavigate();
  const { toggleSidebar, isMobile, setOpenMobile } = useSidebar();
  
  const handleLogout = async () => {
    try {
      // First, attempt to get the current session to check if it's valid
      const { data: sessionData } = await supabase.auth.getSession();
      
      // Only attempt to sign out if there's an active session
      if (sessionData.session) {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      } else {
        // If no session exists, just redirect and show success
        console.log('No active session found, redirecting without API call');
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

  const handleNavigationWithSidebarClose = (path: string) => {
    navigate(path);
    
    if (isMobile) {
      setOpenMobile(false);
    } else {
      toggleSidebar();
    }
  };
  
  return (
    <SidebarFooter className="p-4">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton onClick={() => handleNavigationWithSidebarClose('/')}>
            <Map size={18} />
            <span>View Map</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        
        <SidebarMenuItem>
          <SidebarMenuButton onClick={() => handleNavigationWithSidebarClose('/profile')}>
            <User size={18} />
            <span>Profile</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        
        <SidebarMenuItem>
          <SidebarMenuButton onClick={handleLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
};
