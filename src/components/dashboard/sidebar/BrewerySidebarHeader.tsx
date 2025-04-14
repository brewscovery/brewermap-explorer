
import React from 'react';
import { 
  SidebarHeader
} from '@/components/ui/sidebar';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Brewery } from '@/types/brewery';

interface BrewerySidebarHeaderProps {
  selectedBrewery: Brewery | null;
  isLoading: boolean;
}

export const BrewerySidebarHeader = ({ 
  selectedBrewery, 
  isLoading 
}: BrewerySidebarHeaderProps) => {
  // Create initials from brewery name for fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Loading state
  if (isLoading) {
    return (
      <SidebarHeader className="flex flex-col items-center p-4">
        <div className="w-full flex items-center space-x-3">
          <div className="animate-pulse h-10 w-10 bg-muted rounded-full"></div>
          <div className="animate-pulse h-4 w-32 bg-muted rounded"></div>
        </div>
      </SidebarHeader>
    );
  }
  
  // No brewery selected
  if (!selectedBrewery) {
    return (
      <SidebarHeader className="p-4">
        <div className="text-sm text-muted-foreground">
          No brewery selected
        </div>
      </SidebarHeader>
    );
  }
  
  return (
    <SidebarHeader className="flex flex-col items-center p-4">
      <div className="w-full flex items-center space-x-3">
        <Avatar>
          {selectedBrewery.logo_url ? (
            <AvatarImage 
              src={selectedBrewery.logo_url} 
              alt={`${selectedBrewery.name} logo`} 
            />
          ) : null}
          <AvatarFallback className="bg-primary text-primary-foreground font-medium">
            {getInitials(selectedBrewery.name)}
          </AvatarFallback>
        </Avatar>
        
        <div className="overflow-hidden text-ellipsis">
          <h3 className="font-medium text-sm truncate">
            {selectedBrewery.name}
          </h3>
        </div>
      </div>
    </SidebarHeader>
  );
};
