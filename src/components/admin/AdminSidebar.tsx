
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
  const { state } = useSidebar();
  
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

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className={`fixed left-0 top-0 z-30 h-full max-w-[16rem] ${state === "expanded" ? "animate-slide-in-left" : "animate-slide-out-left"} shadow-lg bg-white`}>
      <div className="flex flex-col h-full overflow-auto">
        <div className="flex flex-col items-center justify-center p-4 border-b">
          <h2 className="font-bold text-xl">Admin Dashboard</h2>
        </div>
        
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton 
                isActive={isActive('/admin')}
                onClick={() => navigate('/admin')}
              >
                <LayoutDashboard />
                <span>Dashboard</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton 
                isActive={isActive('/admin/claims')}
                onClick={() => navigate('/admin/claims')}
              >
                <ClipboardCheck />
                <span>Brewery Claims</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton 
                isActive={isActive('/admin/breweries')}
                onClick={() => navigate('/admin/breweries')}
              >
                <Beer />
                <span>Breweries</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton 
                isActive={isActive('/admin/users')}
                onClick={() => navigate('/admin/users')}
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
              <SidebarMenuButton onClick={() => navigate('/')}>
                <Map size={18} />
                <span>View Map</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => navigate('/profile')}>
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
