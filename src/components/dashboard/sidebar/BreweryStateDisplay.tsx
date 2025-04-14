
import React from 'react';
import { SidebarMenuItem } from '@/components/ui/sidebar';
import { Brewery } from '@/types/brewery';

interface BreweryStateDisplayProps {
  isLoading: boolean;
  breweries: Brewery[];
}

export const BreweryStateDisplay: React.FC<BreweryStateDisplayProps> = ({ 
  isLoading,
  breweries
}) => {
  if (isLoading) {
    return (
      <SidebarMenuItem>
        <div className="px-2 py-1.5 text-sm text-muted-foreground">
          Loading breweries...
        </div>
      </SidebarMenuItem>
    );
  }
  
  if (breweries.length === 0) {
    return (
      <SidebarMenuItem>
        <div className="px-2 py-1.5 text-sm text-muted-foreground">
          No breweries yet
        </div>
      </SidebarMenuItem>
    );
  }
  
  return null;
};
