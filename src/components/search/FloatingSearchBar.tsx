
import React from 'react';
import EnhancedSearchBar from './EnhancedSearchBar';
import { cn } from '@/lib/utils';
import { PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";

interface FloatingSearchBarProps {
  onVenueSelect: (venue: any) => void;
  className?: string;
}

const FloatingSearchBar: React.FC<FloatingSearchBarProps> = ({ 
  onVenueSelect,
  className 
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
      "fixed z-[100] top-4 left-4 w-[320px] md:w-[400px] lg:w-[520px]",
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
        <EnhancedSearchBar 
          onVenueSelect={handleVenueSelect}
          className="w-full shadow-lg"
        />
      </div>
    </div>
  );
};

export default FloatingSearchBar;
