
import React from 'react';
import EnhancedSearchBar from './EnhancedSearchBar';
import { cn } from '@/lib/utils';
import { PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import MapFilters from './MapFilters';

interface FloatingSearchBarProps {
  onVenueSelect: (venue: any) => void;
  className?: string;
  activeFilters?: string[];
  onFilterChange?: (filters: string[]) => void;
}

const FloatingSearchBar: React.FC<FloatingSearchBarProps> = ({ 
  onVenueSelect,
  className,
  activeFilters = [],
  onFilterChange = () => {}
}) => {
  const { state, toggleSidebar, isMobile, openMobile, setOpenMobile } = useSidebar();
  
  const handleVenueSelect = (venue) => {
    console.log('FloatingSearchBar: onVenueSelect called with venue:', venue?.name || 'none');
    onVenueSelect(venue);
  };

  const handleSidebarToggle = () => {
    console.log("FloatingSearchBar: handleSidebarToggle called");
    if (isMobile) {
      setOpenMobile(!openMobile);
    } else {
      toggleSidebar();
    }
  };

  return (
    <div className={cn(
      "fixed z-[100] top-4 left-4 sm:max-w-[400px] md:max-w-[450px] lg:max-w-sm", 
      "animate-fade-in duration-300",
      className
    )}>
      <div className="flex w-full items-center">
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "mr-2 rounded-full shadow-md hover:shadow-lg transition-all duration-200",
            "bg-white/80 backdrop-blur-sm h-12 w-12 flex-shrink-0"
          )}
          onClick={handleSidebarToggle}
        >
          <PanelLeft className={cn(
            "h-4 w-4 transition-transform duration-200",
            !isMobile && state === "expanded" ? "rotate-0" : "rotate-180"
          )} />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
        <div className="flex flex-1 items-center gap-2">
          <EnhancedSearchBar 
            onVenueSelect={handleVenueSelect}
            className="flex-1 shadow-lg"
          />
          <MapFilters 
            activeFilters={activeFilters} 
            onFilterChange={onFilterChange} 
            className="hidden sm:flex"
          />
        </div>
      </div>
      {/* Responsive filters for mobile */}
      <div className="mt-2 sm:hidden">
        <MapFilters 
          activeFilters={activeFilters} 
          onFilterChange={onFilterChange} 
          className="justify-center"
        />
      </div>
    </div>
  );
};

export default FloatingSearchBar;
