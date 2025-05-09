
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  SidebarContent, 
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar
} from '@/components/ui/sidebar';
import { ClipboardCheck, Users, Beer, LayoutDashboard, LogOut, Map, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, toggleSidebar, isMobile, setOpenMobile } = useSidebar();
  
  const handleNavigationWithSidebarClose = (path: string) => {
    // First close sidebar
    if (isMobile) {
      setOpenMobile(false);
    } else {
      toggleSidebar();
    }
    
    // Then navigate
    navigate(path);
  };

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
      
      // Close sidebar before navigating
      if (isMobile) {
        setOpenMobile(false);
      } else {
        toggleSidebar();
      }
      
      // Always navigate and show success regardless of session state
      navigate('/');
      toast.success('Logged out successfully');
    } catch (error: any) {
      console.error('Logout error:', error);
      
      // Close sidebar even if there's an error
      if (isMobile) {
        setOpenMobile(false);
      } else {
        toggleSidebar();
      }
      
      // Even if there's an error, force navigation to the login page
      navigate('/');
      toast.error('Error during logout, but you have been redirected home.');
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className={`fixed left-0 top-[73px] z-30 h-[calc(100vh-73px)] max-w-[16rem] ${state === "expanded" ? "animate-slide-in-left" : "animate-slide-out-left"} shadow-lg bg-white`}>
      <div className="flex flex-col h-full overflow-auto">
        <div className="flex flex-col items-center justify-center p-4 border-b">
          <h2 className="font-bold text-xl">Admin Dashboard</h2>
        </div>
        
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton 
                isActive={isActive('/admin')}
                onClick={() => handleNavigationWithSidebarClose('/admin')}
              >
                <LayoutDashboard />
                <span>Dashboard</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton 
                isActive={isActive('/admin/claims')}
                onClick={() => handleNavigationWithSidebarClose('/admin/claims')}
              >
                <ClipboardCheck />
                <span>Brewery Claims</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton 
                isActive={isActive('/admin/breweries')}
                onClick={() => handleNavigationWithSidebarClose('/admin/breweries')}
              >
                <Beer />
                <span>Breweries</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton 
                isActive={isActive('/admin/users')}
                onClick={() => handleNavigationWithSidebarClose('/admin/users')}
              >
                <Users />
                <span>Users</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>

        <div className="p-4 mt-auto border-t">
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
                <LogOut />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
