
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
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
  Store,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useBreweryFetching } from '@/hooks/useBreweryFetching';
import { useAuth } from '@/contexts/AuthContext';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Brewery } from '@/types/brewery';
import { useBreweryVenues } from '@/hooks/useBreweryVenues';
import { Venue } from '@/types/venue';

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
  
  // Track venues per brewery to avoid excessive fetching
  const [breweryVenues, setBreweryVenues] = useState<Record<string, Venue[]>>({});
  
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
  
  const isVenueActive = (path: string, venueId: string) => {
    return location.pathname === path && location.search.includes(`venueId=${venueId}`);
  };
  
  const toggleBreweryExpanded = (breweryId: string) => {
    setExpandedBreweries(prev => ({
      ...prev,
      [breweryId]: !prev[breweryId]
    }));
    
    // If expanding, ensure we have venues for this brewery
    if (!expandedBreweries[breweryId]) {
      fetchVenuesForBrewery(breweryId);
    }
  };
  
  const fetchVenuesForBrewery = async (breweryId: string) => {
    if (breweryVenues[breweryId] || !breweryId) return;
    
    try {
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .eq('brewery_id', breweryId)
        .order('name');
        
      if (error) throw error;
      
      setBreweryVenues(prev => ({
        ...prev,
        [breweryId]: data as Venue[]
      }));
    } catch (error) {
      console.error('Error fetching venues:', error);
    }
  };
  
  const handleAddVenue = (brewery: Brewery) => {
    setSelectedBrewery(brewery);
    navigate('/dashboard/venues?action=add');
  };
  
  const handleVenueClick = (venue: Venue) => {
    navigate(`/dashboard/venues?venueId=${venue.id}`);
  };

  // Prefetch venues for the selected brewery
  useEffect(() => {
    if (selectedBrewery?.id) {
      fetchVenuesForBrewery(selectedBrewery.id);
      
      // Auto-expand the selected brewery
      setExpandedBreweries(prev => ({
        ...prev,
        [selectedBrewery.id]: true
      }));
    }
  }, [selectedBrewery?.id]);

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
                    
                    {/* List of venues */}
                    {breweryVenues[brewery.id]?.map((venue) => (
                      <SidebarMenuSubItem key={venue.id}>
                        <SidebarMenuSubButton
                          onClick={() => handleVenueClick(venue)}
                          isActive={isVenueActive('/dashboard/venues', venue.id)}
                        >
                          <Store size={14} />
                          <span className="truncate">{venue.name}</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                    
                    {/* Loading or empty state */}
                    {!breweryVenues[brewery.id] && (
                      <SidebarMenuSubItem>
                        <div className="px-2 py-1 text-xs text-muted-foreground">
                          Loading venues...
                        </div>
                      </SidebarMenuSubItem>
                    )}
                    
                    {breweryVenues[brewery.id]?.length === 0 && (
                      <SidebarMenuSubItem>
                        <div className="px-2 py-1 text-xs text-muted-foreground">
                          No venues yet
                        </div>
                      </SidebarMenuSubItem>
                    )}
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
