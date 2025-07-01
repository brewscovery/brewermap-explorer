
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Sidebar, 
  SidebarContent as UISidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar
} from '@/components/ui/sidebar';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { 
  LayoutDashboard, Settings, Store, Plus, Map, LogIn, User, 
  Beer, ClipboardCheck, Users, LogOut, Star, History, 
  CreditCard, Calendar, ListTodo, Bell, Upload
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useBreweryFetching } from '@/hooks/useBreweryFetching';
import { useBreweryVenues } from '@/hooks/useBreweryVenues';
import { BrewerySidebarHeader } from '@/components/dashboard/sidebar/BrewerySidebarHeader';
import { SidebarFooterMenu } from '@/components/dashboard/sidebar/SidebarFooterMenu';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import { Brewery } from '@/types/brewery';
import { Venue } from '@/types/venue';

const SidebarContentComponent = ({ isMobileView = false }: { isMobileView?: boolean }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userType, firstName } = useAuth();
  const { toggleSidebar, isMobile, setOpenMobile } = useSidebar();
  
  const { 
    breweries, 
    selectedBrewery, 
    isLoading: breweriesLoading,
    setSelectedBrewery
  } = useBreweryFetching(userType === 'business' ? user?.id : null);
  
  const { venues: venuesForSelectedBrewery, isLoading: venuesLoading } = useBreweryVenues(
    userType === 'business' && selectedBrewery ? selectedBrewery.id : null
  );

  const handleNavigationWithSidebarClose = (path: string) => {
    // First navigate to maintain the app's flow
    navigate(path);
    
    // Then close sidebar after a very slight delay to ensure smooth transition
    setTimeout(() => {
      if (isMobile) {
        setOpenMobile(false);
      } else {
        toggleSidebar();
      }
    }, 10);
  };

  const isActive = (path: string) => location.pathname === path;
  const isVenueActive = (path: string, venueId: string) => {
    return location.pathname === path && location.search.includes(`venueId=${venueId}`);
  };

  const handleBrewerySelect = (brewery: Brewery) => {
    setSelectedBrewery(brewery);
    handleNavigationWithSidebarClose('/dashboard');
  };

  const handleAddVenue = (brewery: Brewery) => {
    setSelectedBrewery(brewery);
    handleNavigationWithSidebarClose('/dashboard/venues?action=add');
  };
  
  const handleVenueClick = (venue: Venue) => {
    handleNavigationWithSidebarClose(`/dashboard/venues?venueId=${venue.id}`);
  };

  const handleLogout = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (sessionData.session) {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      }
      
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('supabase.auth.refreshToken');
      
      // First close sidebar
      if (isMobile) {
        setOpenMobile(false);
      } else {
        toggleSidebar();
      }
      
      // Then navigate
      handleNavigationWithSidebarClose('/');
      toast.success('Logged out successfully');
    } catch (error: any) {
      console.error('Logout error:', error);
      
      // Close sidebar even if there's an error
      if (isMobile) {
        setOpenMobile(false);
      } else {
        toggleSidebar();
      }
      
      handleNavigationWithSidebarClose('/');
      toast.error('Error during logout, but you have been redirected home.');
    }
  };

  return (
    <div className="flex flex-col h-full overflow-auto">
      {userType === 'business' && (
        <div className={isMobileView ? "relative z-50" : ""}>
          <BrewerySidebarHeader 
            selectedBrewery={selectedBrewery} 
            breweries={breweries}
            isLoading={breweriesLoading} 
            onBrewerySelect={handleBrewerySelect}
          />
        </div>
      )}
      
      {userType === 'regular' && user && (
        <div className="flex flex-col p-4 border-b">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Hello, {firstName || 'User'}</h2>
            <NotificationCenter />
          </div>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      )}
      
      <UISidebarContent>
        <SidebarMenu>
          
          {!user ? (
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => handleNavigationWithSidebarClose('/auth')}>
                <LogIn size={18} />
                <span>Login / Sign Up</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ) : (
            <>
              {userType === 'admin' && (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={isActive('/admin')}
                      onClick={() => handleNavigationWithSidebarClose('/admin')}
                    >
                      <LayoutDashboard size={18} />
                      <span>Admin Dashboard</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={isActive('/admin/claims')}
                      onClick={() => handleNavigationWithSidebarClose('/admin/claims')}
                    >
                      <ClipboardCheck size={18} />
                      <span>Brewery Claims</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={isActive('/admin/breweries')}
                      onClick={() => handleNavigationWithSidebarClose('/admin/breweries')}
                    >
                      <Beer size={18} />
                      <span>Breweries</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={isActive('/admin/brewery-import')}
                      onClick={() => handleNavigationWithSidebarClose('/admin/brewery-import')}
                    >
                      <Upload size={18} />
                      <span>Brewery Import</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={isActive('/admin/users')}
                      onClick={() => handleNavigationWithSidebarClose('/admin/users')}
                    >
                      <Users size={18} />
                      <span>Users</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}

              {userType === 'business' && (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={isActive('/dashboard')}
                      onClick={() => handleNavigationWithSidebarClose('/dashboard')}
                    >
                      <LayoutDashboard size={18} />
                      <span>Overview</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={isActive('/dashboard/events')}
                      onClick={() => handleNavigationWithSidebarClose('/dashboard/events')}
                    >
                      <Calendar size={18} />
                      <span>Events</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  {selectedBrewery && (
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        onClick={() => handleNavigationWithSidebarClose('/dashboard/venues')}
                        isActive={isActive('/dashboard/venues')}
                      >
                        <Store size={18} />
                        <span>Venues</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                  
                  {selectedBrewery && venuesForSelectedBrewery && venuesForSelectedBrewery.length > 0 && (
                    <SidebarMenuSub>
                      {venuesForSelectedBrewery.map((venue) => (
                        <SidebarMenuSubItem key={venue.id}>
                          <SidebarMenuSubButton
                            onClick={() => handleVenueClick(venue)}
                            isActive={isVenueActive('/dashboard/venues', venue.id)}
                            className={isVenueActive('/dashboard/venues', venue.id) ? "font-semibold" : ""}
                          >
                            <Store size={14} />
                            <span className="truncate">{venue.name}</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  )}
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={isActive('/dashboard/settings')}
                      onClick={() => handleNavigationWithSidebarClose('/dashboard/settings')}
                    >
                      <Settings size={18} />
                      <span>Settings</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}

              {userType === 'regular' && (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={isActive('/dashboard')}
                      onClick={() => handleNavigationWithSidebarClose('/dashboard')}
                    >
                      <LayoutDashboard size={18} />
                      <span>Dashboard</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={isActive('/dashboard/favorites')}
                      onClick={() => handleNavigationWithSidebarClose('/dashboard/favorites')}
                    >
                      <Star size={18} />
                      <span>My Favorites</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={isActive('/dashboard/todoLists')}
                      onClick={() => handleNavigationWithSidebarClose('/dashboard/todoLists')}
                    >
                      <ListTodo size={18} />
                      <span>ToDo Lists</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={isActive('/dashboard/eventsExplorer')}
                      onClick={() => handleNavigationWithSidebarClose('/dashboard/eventsExplorer')}
                    >
                      <Calendar size={18} />
                      <span>Events</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={isActive('/dashboard/discoveries')}
                      onClick={() => handleNavigationWithSidebarClose('/dashboard/discoveries')}
                    >
                      <Map size={18} />
                      <span>Brewscoveries</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={isActive('/dashboard/settings')}
                      onClick={() => handleNavigationWithSidebarClose('/dashboard/settings')}
                    >
                      <Settings size={18} />
                      <span>Account Settings</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={isActive('/dashboard/subscription')}
                      onClick={() => handleNavigationWithSidebarClose('/dashboard/subscription')}
                    >
                      <CreditCard size={18} />
                      <span>Subscription</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}

            </>
          )}
        </SidebarMenu>
      </UISidebarContent>
      
      {user && <SidebarFooterMenu />}
    </div>
  );
};

const UnifiedSidebar = () => {
  const { state, isMobile, openMobile, setOpenMobile } = useSidebar();
  
  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent side="left" className="p-0 w-[80%] max-w-[16rem] z-[110] overflow-hidden">
          <div className="h-full overflow-y-auto">
            <SidebarContentComponent isMobileView={true} />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className={`fixed left-0 top-[73px] z-[30] h-[calc(100vh-73px)] max-w-[16rem] transition-transform duration-300 ease-in-out ${state === "collapsed" ? "-translate-x-full" : "translate-x-0"} shadow-lg bg-white`}>
      <SidebarContentComponent />
    </div>
  );
};

export default UnifiedSidebar;
