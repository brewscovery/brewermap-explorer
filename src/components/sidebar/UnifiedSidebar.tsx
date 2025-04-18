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
  CreditCard
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useBreweryFetching } from '@/hooks/useBreweryFetching';
import { useBreweryVenues } from '@/hooks/useBreweryVenues';
import { BrewerySidebarHeader } from '@/components/dashboard/sidebar/BrewerySidebarHeader';
import { SidebarFooterMenu } from '@/components/dashboard/sidebar/SidebarFooterMenu';
import { Brewery } from '@/types/brewery';
import { Venue } from '@/types/venue';

const SidebarContentComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userType } = useAuth();
  
  const { 
    breweries, 
    selectedBrewery, 
    isLoading: breweriesLoading,
    setSelectedBrewery
  } = useBreweryFetching(userType === 'business' ? user?.id : null);
  
  const { venues: venuesForSelectedBrewery, isLoading: venuesLoading } = useBreweryVenues(
    userType === 'business' && selectedBrewery ? selectedBrewery.id : null
  );

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
  const isVenueActive = (path: string, venueId: string) => {
    return location.pathname === path && location.search.includes(`venueId=${venueId}`);
  };

  const handleBrewerySelect = (brewery: Brewery) => {
    setSelectedBrewery(brewery);
    navigate('/dashboard');
  };

  const handleAddVenue = (brewery: Brewery) => {
    setSelectedBrewery(brewery);
    navigate('/dashboard/venues?action=add');
  };
  
  const handleVenueClick = (venue: Venue) => {
    navigate(`/dashboard/venues?venueId=${venue.id}`);
  };

  return (
    <div className="flex flex-col h-full overflow-auto">
      {userType === 'business' && (
        <BrewerySidebarHeader 
          selectedBrewery={selectedBrewery} 
          breweries={breweries}
          isLoading={breweriesLoading} 
          onBrewerySelect={handleBrewerySelect}
        />
      )}
      
      {userType === 'regular' && user && (
        <div className="flex flex-col p-4 border-b">
          <h2 className="text-lg font-semibold">Hello, {user.email?.split('@')[0] || 'User'}</h2>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
      )}
      
      <UISidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={() => navigate('/')}
              isActive={isActive('/')}
            >
              <Map size={18} />
              <span>View Map</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {!user ? (
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => navigate('/auth')}>
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

              {userType === 'business' && (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={isActive('/dashboard')}
                      onClick={() => navigate('/dashboard')}
                    >
                      <LayoutDashboard size={18} />
                      <span>Overview</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  {selectedBrewery && (
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        onClick={() => navigate('/dashboard/venues')}
                        isActive={isActive('/dashboard/venues')}
                      >
                        <Store size={18} />
                        <span>Venues</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                  
                  {selectedBrewery && (
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        onClick={() => handleAddVenue(selectedBrewery)}
                        className="text-sm text-muted-foreground"
                      >
                        <Plus size={16} />
                        <span>Add Venue</span>
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
                      onClick={() => navigate('/dashboard/settings')}
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
                </>
              )}

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
                <SidebarMenuButton onClick={handleLogout}>
                  <LogOut size={18} />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
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
        <SheetContent side="left" className="p-0 w-[80%] max-w-[16rem]">
          <SidebarContentComponent />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className={`fixed left-0 top-[73px] z-30 h-[calc(100vh-73px)] max-w-[16rem] transition-transform duration-300 ease-in-out ${state === "collapsed" ? "-translate-x-full" : "translate-x-0"} shadow-lg bg-white`}>
      <SidebarContentComponent />
    </div>
  );
};

export default UnifiedSidebar;
