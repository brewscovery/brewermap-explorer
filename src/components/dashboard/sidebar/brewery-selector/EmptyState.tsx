
import React from 'react';
import { SidebarHeader } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

interface EmptyStateProps {
  onAddBrewery: () => void;
}

export const EmptyState = ({ onAddBrewery }: EmptyStateProps) => {
  return (
    <SidebarHeader className="p-4">
      <Button 
        variant="outline" 
        onClick={onAddBrewery}
        className="w-full justify-start text-sm"
      >
        <PlusCircle size={16} className="mr-2" />
        Add Brewery
      </Button>
    </SidebarHeader>
  );
};
