
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { 
  PlusCircle, 
  ChevronDown, 
  ChevronRight,
  Beer,
  Store 
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Brewery } from '@/types/brewery';
import { Venue } from '@/types/venue';

interface BreweryListProps {
  breweries: Brewery[];
  expandedBreweries: Record<string, boolean>;
  breweryVenues: Record<string, Venue[]>;
  toggleBreweryExpanded: (breweryId: string) => void;
  handleAddVenue: (brewery: Brewery) => void;
  handleVenueClick: (venue: Venue, brewery: Brewery) => void;
  isVenueActive: (path: string, venueId: string) => boolean;
}

export const BreweryList: React.FC<BreweryListProps> = ({
  breweries,
  expandedBreweries,
  breweryVenues,
  toggleBreweryExpanded,
  handleAddVenue,
  handleVenueClick,
  isVenueActive
}) => {
  return (
    <>
      {breweries.map((brewery) => {
        // Pre-compute active state outside the map for venues to avoid excessive calculations
        const venuesWithActiveState = breweryVenues[brewery.id]?.map(venue => ({
          venue,
          isActive: isVenueActive('/dashboard/venues', venue.id)
        }));
        
        return (
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
                  
                  {/* List of venues with clearly visible active states */}
                  {venuesWithActiveState?.map(({ venue, isActive }) => (
                    <SidebarMenuSubItem key={venue.id}>
                      <SidebarMenuSubButton
                        onClick={() => handleVenueClick(venue, brewery)}
                        isActive={isActive}
                        className={isActive ? "font-semibold" : ""}
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
        );
      })}
    </>
  );
};
