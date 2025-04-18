
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sidebar as ShadcnSidebar, 
  SidebarContent
} from '@/components/ui/sidebar';
import { MainSidebarMenu } from './MainSidebarMenu';
import { SidebarFooterMenu } from './SidebarFooterMenu';
import { BrewerySidebarHeader } from './BrewerySidebarHeader';
import { useSidebarData } from './useSidebarData';
import { useBreweryFetching } from '@/hooks/useBreweryFetching';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/components/ui/sidebar';
import { Venue } from '@/types/venue';
import { Brewery } from '@/types/brewery';

const DashboardSidebar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { state } = useSidebar();
  
  // Fetch breweries for the current user
  const { 
    breweries, 
    selectedBrewery, 
    isLoading,
    setSelectedBrewery
  } = useBreweryFetching(user?.id);
  
  // Custom hook for sidebar data and behavior
  const { 
    expandedBreweries,
    breweryVenues,
    isActive,
    isVenueActive,
    toggleBreweryExpanded
  } = useSidebarData(breweries, selectedBrewery, setSelectedBrewery);
  
  const handleAddVenue = (brewery: Brewery) => {
    setSelectedBrewery(brewery);
    navigate('/dashboard/venues?action=add');
  };
  
  const handleVenueClick = (venue: Venue) => {
    // Only navigate to the venue details page without changing the selected brewery
    navigate(`/dashboard/venues?venueId=${venue.id}`);
  };

  const handleBrewerySelect = (brewery: Brewery) => {
    // First set the selected brewery
    setSelectedBrewery(brewery);
    // Then navigate to the dashboard to show it
    navigate('/dashboard');
  };

  return (
    <div className={`fixed left-0 top-[73px] z-30 h-[calc(100vh-73px)] max-w-[16rem] transition-transform duration-300 ease-in-out ${state === "collapsed" ? "-translate-x-full" : "translate-x-0"} shadow-lg bg-white`}>
      <div className="flex flex-col h-full overflow-auto">
        <BrewerySidebarHeader 
          selectedBrewery={selectedBrewery} 
          breweries={breweries}
          isLoading={isLoading} 
          onBrewerySelect={handleBrewerySelect}
        />
        
        <SidebarContent>
          <MainSidebarMenu 
            breweries={breweries}
            isLoading={isLoading}
            expandedBreweries={expandedBreweries}
            breweryVenues={breweryVenues}
            toggleBreweryExpanded={toggleBreweryExpanded}
            handleAddVenue={handleAddVenue}
            handleVenueClick={handleVenueClick}
            isActive={isActive}
            isVenueActive={isVenueActive}
            selectedBrewery={selectedBrewery}
          />
        </SidebarContent>
        
        <SidebarFooterMenu />
      </div>
    </div>
  );
};

export default DashboardSidebar;
