
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Sidebar, 
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from '@/components/ui/sidebar';
import { User } from '@supabase/supabase-js';
import { LayoutDashboard, Star, History, Map, Settings, CreditCard } from 'lucide-react';
import { SidebarFooterMenu } from './sidebar/SidebarFooterMenu';

interface RegularUserSidebarProps {
  user: User | null;
  displayName: string;
}

const RegularUserSidebar = ({ user, displayName }: RegularUserSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Function to check if the current path matches a given route
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <Sidebar>
      <div className="flex flex-col p-4 border-b">
        <h2 className="text-lg font-semibold">Hello, {displayName || 'User'}</h2>
        <p className="text-sm text-muted-foreground">{user?.email}</p>
      </div>
      
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              isActive={isActive('/dashboard')}
              onClick={() => navigate('/dashboard')}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
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
          
          <SidebarMenuItem>
            <SidebarMenuButton 
              isActive={isActive('/dashboard/discoveries')}
              onClick={() => navigate('/dashboard/discoveries')}
            >
              <Map size={18} />
              <span>Brewery Discoveries</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton 
              isActive={isActive('/dashboard/settings')}
              onClick={() => navigate('/dashboard/settings')}
            >
              <Settings size={18} />
              <span>Account Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton 
              isActive={isActive('/dashboard/subscription')}
              onClick={() => navigate('/dashboard/subscription')}
            >
              <CreditCard size={18} />
              <span>Subscription</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooterMenu />
    </Sidebar>
  );
};

export default RegularUserSidebar;
