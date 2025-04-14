
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sidebar, 
  SidebarContent
} from '@/components/ui/sidebar';
import { MainSidebarMenu } from './MainSidebarMenu';
import { SidebarFooterMenu } from './SidebarFooterMenu';
import { BrewerySidebarHeader } from './BrewerySidebarHeader';
import { useSidebarData } from './useSidebarData';
import { useBreweryFetching } from '@/hooks/useBreweryFetching';
import { useAuth } from '@/contexts/AuthContext';
import { Venue } from '@/types/venue';
import { Brewery } from '@/types/brewery';

const DashboardSidebar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
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
  
  const handleVenueClick = (venue: Venue, brewery: Brewery) => {
    // First, set the selected brewery to the one that owns this venue
    console.log(`Setting selected brewery to ${brewery.name} for venue ${venue.name}`);
    setSelectedBrewery(brewery);
    
    // Then navigate to the venue details page
    navigate(`/dashboard/venues?venueId=${venue.id}`);
  };

  return (
    <Sidebar>
      {/* Pass breweries and onBrewerySelect to BrewerySidebarHeader */}
      <BrewerySidebarHeader 
        selectedBrewery={selectedBrewery} 
        breweries={breweries}
        isLoading={isLoading} 
        onBrewerySelect={setSelectedBrewery}
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
        />
      </SidebarContent>
      
      <SidebarFooterMenu />
    </Sidebar>
  );
};

export default DashboardSidebar;
