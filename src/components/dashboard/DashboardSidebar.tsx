
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import { 
  Beer, 
  MapPin, 
  Settings, 
  Map, 
  User, 
  LogOut, 
  LayoutDashboard,
  PlusCircle,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useBreweryFetching } from '@/hooks/useBreweryFetching';
import { useAuth } from '@/contexts/AuthContext';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Brewery } from '@/types/brewery';

const DashboardSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // Fetch breweries for the current user
  const { 
    breweries, 
    selectedBrewery, 
    isLoading,
    setSelectedBrewery
  } = useBreweryFetching(user?.id);
  
  // Track which brewery sections are expanded
  const [expandedBreweries, setExpandedBreweries] = useState<Record<string, boolean>>({});
  
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
  
  const toggleBreweryExpanded = (breweryId: string) => {
    setExpandedBreweries(prev => ({
      ...prev,
      [breweryId]: !prev[breweryId]
    }));
  };
  
  const handleAddVenue = (brewery: Brewery) => {
    setSelectedBrewery(brewery);
    navigate('/dashboard/venues');
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              isActive={isActive('/dashboard')}
              onClick={() => navigate('/dashboard')}
            >
              <LayoutDashboard size={18} />
              <span>Overview</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          {/* Add Brewery Button - Always visible */}
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={() => navigate('/dashboard/breweries')}
            >
              <PlusCircle size={18} />
              <span>Add Brewery</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          {/* Dynamic Brewery List */}
          {breweries.map((brewery) => (
            <SidebarMenuItem key={brewery.id}>
              <Collapsible
                open={expandedBreweries[brewery.id]} 
                onOpenChange={() => toggleBreweryExpanded(brewery.id)}
                className="w-full"
              >
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton>
                    <Beer size={18} />
                    <span className="flex-1 truncate">{brewery.name}</span>
                    {expandedBreweries[brewery.id] ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {/* Add Venue option */}
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        onClick={() => handleAddVenue(brewery)}
                      >
                        <PlusCircle size={14} />
                        <span>Add Venue</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    
                    {/* View Venues option */}
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        onClick={() => {
                          setSelectedBrewery(brewery);
                          navigate('/dashboard/venues');
                        }}
                        isActive={
                          isActive('/dashboard/venues') && 
                          selectedBrewery?.id === brewery.id
                        }
                      >
                        <MapPin size={14} />
                        <span>Manage Venues</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </Collapsible>
            </SidebarMenuItem>
          ))}
          
          {isLoading && (
            <SidebarMenuItem>
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                Loading breweries...
              </div>
            </SidebarMenuItem>
          )}
          
          {!isLoading && breweries.length === 0 && (
            <SidebarMenuItem>
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                No breweries yet
              </div>
            </SidebarMenuItem>
          )}
          
          <SidebarMenuItem>
            <SidebarMenuButton 
              isActive={isActive('/dashboard/settings')}
              onClick={() => navigate('/dashboard/settings')}
            >
              <Settings size={18} />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      
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
    </Sidebar>
  );
};

export default DashboardSidebar;
