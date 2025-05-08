
import React, { useState } from 'react';
import EnhancedSearchBar from './EnhancedSearchBar';
import { cn } from '@/lib/utils';
import { PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import MapFilters from './MapFilters';
import LoginPopover from '@/components/auth/LoginPopover';
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  const { state, toggleSidebar, isMobile, openMobile, setOpenMobile } = useSidebar();
  const { user } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  
  const handleVenueSelect = (venue) => {
    console.log('FloatingSearchBar: onVenueSelect called with venue:', venue?.name || 'none');
    onVenueSelect(venue);
  };

  const handleSidebarToggle = () => {
    console.log("FloatingSearchBar: handleSidebarToggle called");
    if (user) {
      // If user is authenticated, toggle sidebar as normal
      if (isMobile) {
        setOpenMobile(!openMobile);
      } else {
        toggleSidebar();
      }
    } else {
      // If user is not authenticated, we don't toggle the sidebar
      // Login popover will be shown via the LoginPopover component
      setLoginOpen(true);
    }
  };

  return (
    <div className={cn(
      "fixed z-[100] top-4 left-4 right-4 flex flex-col",
      "animate-fade-in duration-300",
      className
    )}>
      <div className="flex w-full items-center">
        {user ? (
          // Regular sidebar toggle for authenticated users
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
        ) : (
          // Login popover for unauthenticated users
          <LoginPopover 
            open={loginOpen} 
            onOpenChange={setLoginOpen}
            triggerElement={
              <Button
                variant="outline"
                size="icon"
                className={cn(
                  "mr-2 rounded-full shadow-md hover:shadow-lg transition-all duration-200",
                  "bg-white/80 backdrop-blur-sm h-12 w-12 flex-shrink-0"
                )}
              >
                <PanelLeft className="h-4 w-4" />
                <span className="sr-only">Login</span>
              </Button>
            } 
          />
        )}
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
