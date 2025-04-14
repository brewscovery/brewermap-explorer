
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton 
} from '@/components/ui/sidebar';
import { LayoutDashboard, Settings, PlusCircle } from 'lucide-react';
import { BreweryList } from './BreweryList';
import { BreweryStateDisplay } from './BreweryStateDisplay';
import { Brewery } from '@/types/brewery';
import { Venue } from '@/types/venue';

interface MainSidebarMenuProps {
  breweries: Brewery[];
  isLoading: boolean;
  expandedBreweries: Record<string, boolean>;
  breweryVenues: Record<string, Venue[]>;
  toggleBreweryExpanded: (breweryId: string) => void;
  handleAddVenue: (brewery: Brewery) => void;
  handleVenueClick: (venue: Venue, brewery: Brewery) => void;
  isActive: (path: string) => boolean;
  isVenueActive: (path: string, venueId: string) => boolean;
}

export const MainSidebarMenu: React.FC<MainSidebarMenuProps> = ({
  breweries,
  isLoading,
  expandedBreweries,
  breweryVenues,
  toggleBreweryExpanded,
  handleAddVenue,
  handleVenueClick,
  isActive,
  isVenueActive
}) => {
  const navigate = useNavigate();
  
  return (
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
          isActive={isActive('/dashboard/breweries')}
          onClick={() => navigate('/dashboard/breweries')}
        >
          <PlusCircle size={18} />
          <span>Add Brewery</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
      
      {/* Dynamic Brewery List */}
      <BreweryList 
        breweries={breweries}
        expandedBreweries={expandedBreweries}
        breweryVenues={breweryVenues}
        toggleBreweryExpanded={toggleBreweryExpanded}
        handleAddVenue={handleAddVenue}
        handleVenueClick={handleVenueClick}
        isVenueActive={isVenueActive}
      />
      
      {/* Loading or Empty State */}
      <BreweryStateDisplay 
        isLoading={isLoading} 
        breweries={breweries} 
      />
      
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
  );
};
