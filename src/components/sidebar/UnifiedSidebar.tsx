
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar
} from '@/components/ui/sidebar';
import { Map, LogIn, User, Beer, ClipboardCheck, Users, LayoutDashboard, LogOut, Settings, Star, History } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const UnifiedSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userType } = useAuth();
  const { state } = useSidebar();

  const handleLogout = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (sessionData.session) {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      }
      
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('supabase.auth.refreshToken');
      
      navigate('/');
      toast.success('Logged out successfully');
    } catch (error: any) {
      console.error('Logout error:', error);
      navigate('/');
      toast.error('Error during logout, but you have been redirected home.');
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className={`fixed left-0 top-[73px] z-30 h-[calc(100vh-73px)] max-w-[16rem] transition-transform duration-300 ease-in-out ${state === "collapsed" ? "-translate-x-full" : "translate-x-0"} shadow-lg bg-white`}>
      <div className="flex flex-col h-full overflow-auto">
        <SidebarContent>
          <SidebarMenu>
            {/* Map - Always visible */}
            <SidebarMenuItem>
              <SidebarMenuButton 
                onClick={() => navigate('/')}
                isActive={isActive('/')}
              >
                <Map size={18} />
                <span>View Map</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* Auth-dependent menu items */}
            {!user ? (
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate('/auth')}>
                  <LogIn size={18} />
                  <span>Login / Sign Up</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ) : (
              <>
                {/* Admin-specific items */}
                {userType === 'admin' && (
                  <>
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        isActive={isActive('/admin')}
                        onClick={() => navigate('/admin')}
                      >
                        <LayoutDashboard size={18} />
                        <span>Admin Dashboard</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        isActive={isActive('/admin/claims')}
                        onClick={() => navigate('/admin/claims')}
                      >
                        <ClipboardCheck size={18} />
                        <span>Brewery Claims</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        isActive={isActive('/admin/breweries')}
                        onClick={() => navigate('/admin/breweries')}
                      >
                        <Beer size={18} />
                        <span>Breweries</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        isActive={isActive('/admin/users')}
                        onClick={() => navigate('/admin/users')}
                      >
                        <Users size={18} />
                        <span>Users</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </>
                )}

                {/* Business user-specific items */}
                {userType === 'business' && (
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={isActive('/dashboard')}
                      onClick={() => navigate('/dashboard')}
                    >
                      <LayoutDashboard size={18} />
                      <span>Dashboard</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}

                {/* Regular user-specific items */}
                {userType === 'regular' && (
                  <>
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        isActive={isActive('/dashboard/favorites')}
                        onClick={() => navigate('/dashboard/favorites')}
                      >
                        <Star size={18} />
                        <span>My Favorites</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        isActive={isActive('/dashboard/history')}
                        onClick={() => navigate('/dashboard/history')}
                      >
                        <History size={18} />
                        <span>Check-in History</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </>
                )}

                {/* Common authenticated user items */}
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    isActive={isActive('/profile')}
                    onClick={() => navigate('/profile')}
                  >
                    <User size={18} />
                    <span>Profile</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    isActive={isActive('/settings')}
                    onClick={() => navigate('/settings')}
                  >
                    <Settings size={18} />
                    <span>Settings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={handleLogout}>
                    <LogOut size={18} />
                    <span>Logout</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </>
            )}
          </SidebarMenu>
        </SidebarContent>
      </div>
    </div>
  );
};

export default UnifiedSidebar;
