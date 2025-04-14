
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarFooter 
} from '@/components/ui/sidebar';
import { Map, User, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const SidebarFooterMenu: React.FC = () => {
  const navigate = useNavigate();
  
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
    <SidebarFooter className="p-4">
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
            <LogOut size={18} />
            <span>Logout</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
};
