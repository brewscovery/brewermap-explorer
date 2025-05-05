
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PanelLeft, LogOut, Map, User, ChevronDown, Shield, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import LoginPopover from '@/components/auth/LoginPopover';
import { useSidebar } from '@/components/ui/sidebar';
import EnhancedSearchBar from '@/components/search/EnhancedSearchBar';
import { useVenueData } from '@/hooks/useVenueData';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import type { Venue } from '@/types/venue';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userType, firstName, lastName } = useAuth();
  const { selectedVenue, setSelectedVenue } = useVenueData();
  const { toggleSidebar } = useSidebar();
  
  const isOnDashboard = location.pathname.includes('/dashboard');
  const isOnAdmin = location.pathname.includes('/admin');
  
  // Log initial state
  console.log('Header: Component rendered with selectedVenue:', selectedVenue?.name || 'null');
  
  // Display name based on user type
  const displayName = firstName || lastName 
    ? `${firstName || ''} ${lastName || ''}`.trim()
    : userType === 'business' 
      ? 'Business'
      : userType === 'admin'
        ? 'Admin'
        : 'User';

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

  const handleVenueSelect = (venue: Venue) => {
    if (!venue) return;
    
    console.log('Header: Venue selected from search:', venue.name);
    console.log('Header: Venue object:', venue);
    console.log('Header: Venue coordinates:', {
      lat: venue.latitude,
      lng: venue.longitude
    });
    
    // Create a deep copy of the venue using JSON parse/stringify
    const venueCopy = JSON.parse(JSON.stringify(venue));
    
    // Ensure coordinates are in string format
    if (venueCopy.latitude && venueCopy.longitude) {
      venueCopy.latitude = String(venueCopy.latitude);
      venueCopy.longitude = String(venueCopy.longitude);
    }
    
    // Set the selected venue using the useVenueData hook
    setSelectedVenue(venueCopy);
    console.log('Header: setSelectedVenue called with venue:', venueCopy.name);
    
    // If we're not already on the homepage, navigate there
    if (location.pathname !== '/') {
      console.log('Header: Navigating to homepage from:', location.pathname);
      navigate('/');
    }
  };
  
  // Don't show search bar on dashboard pages
  const showSearchBar = !isOnDashboard && !isOnAdmin;
  
  return (
    <div className="p-4 bg-background/80 backdrop-blur-sm border-b fixed w-full z-50 flex items-center">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="mr-4"
      >
        <PanelLeft className="h-4 w-4" />
        <span className="sr-only">Toggle Sidebar</span>
      </Button>

      <div className="flex-1 flex justify-center">
        {showSearchBar && (
          <EnhancedSearchBar 
            onVenueSelect={handleVenueSelect} 
            className="max-w-md w-full"
          />
        )}
      </div>

      <div className="flex items-center gap-4 ml-4">
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <User size={18} />
                <span>{displayName}</span>
                <ChevronDown size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {!isOnDashboard && userType === 'business' && (
                <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                  <LayoutDashboard className="mr-2" size={18} />
                  Dashboard
                </DropdownMenuItem>
              )}
              
              {!isOnAdmin && userType === 'admin' && (
                <DropdownMenuItem onClick={() => navigate('/admin')}>
                  <Shield className="mr-2" size={18} />
                  Admin Dashboard
                </DropdownMenuItem>
              )}
              
              {!isOnDashboard && userType === 'regular' && (
                <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                  <LayoutDashboard className="mr-2" size={18} />
                  Dashboard
                </DropdownMenuItem>
              )}
              
              {(isOnDashboard || isOnAdmin) && (
                <DropdownMenuItem onClick={() => navigate('/')}>
                  <Map className="mr-2" size={18} />
                  View Map
                </DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2" size={18} />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex gap-2">
            <LoginPopover />
            <Button onClick={() => navigate('/auth')}>Sign Up</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
