
import React, { useState } from 'react';
import { SidebarHeader } from '@/components/ui/sidebar';
import { Brewery } from '@/types/brewery';
import CreateBreweryDialog from '@/components/brewery/CreateBreweryDialog';
import { BrewerySelector } from './brewery-selector/BrewerySelector';
import { LoadingState } from './brewery-selector/LoadingState';
import { EmptyState } from './brewery-selector/EmptyState';

interface BrewerySidebarHeaderProps {
  selectedBrewery: Brewery | null;
  breweries: Brewery[];
  isLoading: boolean;
  onBrewerySelect: (brewery: Brewery) => void;
}

export const BrewerySidebarHeader = ({ 
  selectedBrewery, 
  breweries,
  isLoading,
  onBrewerySelect
}: BrewerySidebarHeaderProps) => {
  const [isCreateBreweryDialogOpen, setIsCreateBreweryDialogOpen] = useState(false);
  
  const handleAddBrewery = () => {
    setIsCreateBreweryDialogOpen(true);
  };
  
  const handleBreweryCreated = () => {
    console.log('Brewery created successfully');
  };
  
  if (isLoading) {
    return <LoadingState />;
  }
  
  if (breweries.length === 0) {
    return (
      <>
        <EmptyState onAddBrewery={handleAddBrewery} />
        <CreateBreweryDialog 
          open={isCreateBreweryDialogOpen} 
          onOpenChange={setIsCreateBreweryDialogOpen}
          onSuccess={handleBreweryCreated}
        />
      </>
    );
  }
  
  return (
    <SidebarHeader className="flex flex-col items-center p-4 relative z-50">
      <BrewerySelector
        selectedBrewery={selectedBrewery}
        breweries={breweries}
        onBrewerySelect={onBrewerySelect}
        onAddBrewery={handleAddBrewery}
      />
      
      <CreateBreweryDialog 
        open={isCreateBreweryDialogOpen} 
        onOpenChange={setIsCreateBreweryDialogOpen}
        onSuccess={handleBreweryCreated}
      />
    </SidebarHeader>
  );
};
