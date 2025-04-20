import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton
} from '@/components/ui/sidebar';
import { LayoutDashboard, Settings, Store, Plus } from 'lucide-react';
import { BreweryStateDisplay } from './BreweryStateDisplay';
import { Brewery } from '@/types/brewery';
import { Venue } from '@/types/venue';
import { useBreweryVenues } from '@/hooks/useBreweryVenues';

interface MainSidebarMenuProps {
  breweries: Brewery[];
  isLoading: boolean;
  expandedBreweries: Record<string, boolean>;
  breweryVenues: Record<string, Venue[]>;
  toggleBreweryExpanded: (breweryId: string) => void;
  handleAddVenue: (brewery: Brewery) => void;
  handleVenueClick: (venue: Venue) => void;
  isActive: (path: string) => boolean;
  isVenueActive: (path: string, venueId: string) => boolean;
  selectedBrewery: Brewery | null;
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
  isVenueActive,
  selectedBrewery
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const { venues: venuesForSelectedBrewery, isLoading: venuesLoading } = useBreweryVenues(
    selectedBrewery?.id || null
  );
  
  console.log('MainSidebarMenu - selectedBrewery:', selectedBrewery?.name);
  console.log('MainSidebarMenu - venuesForSelectedBrewery:', venuesForSelectedBrewery?.length);
  
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
      
      {/* Venue section for selected brewery */}
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
      
      {/* Add Venue button for verified breweries */}
      {selectedBrewery && selectedBrewery.is_verified && (
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
      
      {/* Display venues for the selected brewery */}
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
      
      {/* Show loading or empty state for venues */}
      {selectedBrewery && venuesLoading && (
        <SidebarMenuSub>
          <SidebarMenuSubItem>
            <div className="px-2 py-1 text-xs text-muted-foreground">
              Loading venues...
            </div>
          </SidebarMenuSubItem>
        </SidebarMenuSub>
      )}
      
      {selectedBrewery && !venuesLoading && (!venuesForSelectedBrewery || venuesForSelectedBrewery.length === 0) && (
        <SidebarMenuSub>
          <SidebarMenuSubItem>
            <div className="px-2 py-1 text-xs text-muted-foreground">
              No venues yet
            </div>
          </SidebarMenuSubItem>
        </SidebarMenuSub>
      )}
      
      {/* Loading or Empty State for breweries */}
      {!selectedBrewery && (
        <BreweryStateDisplay 
          isLoading={isLoading} 
          breweries={breweries} 
        />
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
  );
};
