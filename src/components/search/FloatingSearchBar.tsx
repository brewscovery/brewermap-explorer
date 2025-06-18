
import React, { useState } from 'react';
import EnhancedSearchBar from './EnhancedSearchBar';
import { cn } from '@/lib/utils';
import { PanelLeft, Filter } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import MapFilters from './MapFilters';
import LoginPopover from '@/components/auth/LoginPopover';
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Venue } from '@/types/venue';
import NotificationCenter from '@/components/notifications/NotificationCenter';

interface FloatingSearchBarProps {
  onVenueSelect: (venue: Venue | null) => void;
  className?: string;
  activeFilters?: string[];
  onFilterChange?: (filters: string[]) => void;
  selectedVenue?: Venue | null;
}

const FloatingSearchBar: React.FC<FloatingSearchBarProps> = ({ 
  onVenueSelect,
  className,
  activeFilters = [],
  onFilterChange = () => {},
  selectedVenue
}) => {
  const { state, toggleSidebar, isMobile, openMobile, setOpenMobile } = useSidebar();
  const { user, firstName, lastName } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  
  const handleVenueSelect = (venue: Venue | null) => {
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

  // Get user initials for the avatar
  const getUserInitials = () => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    } else if (firstName) {
      return firstName[0].toUpperCase();
    } else if (lastName) {
      return lastName[0].toUpperCase();
    } else if (user?.email) {
      return user.email[0].toUpperCase();
    } else {
      return 'U';
    }
  };

  // Create a sidebar toggle button component based on user authentication state
  const SidebarToggleButton = () => {
    if (user) {
      // Avatar with initials for authenticated users
      return (
        <Avatar className="h-5 w-5 cursor-pointer" onClick={handleSidebarToggle}>
          <AvatarFallback className="text-xs font-medium bg-transparent text-gray-600">
            {getUserInitials()}
          </AvatarFallback>
        </Avatar>
      );
    } else {
      // Login popover trigger for unauthenticated users
      return (
        <LoginPopover
          open={loginOpen}
          onOpenChange={setLoginOpen}
          triggerElement={
            <PanelLeft className="h-5 w-5 cursor-pointer" />
          }
        />
      );
    }
  };

  // Create a filter toggle button component
  const FilterToggleButton = () => (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <div 
            onClick={() => setFiltersVisible(prev => !prev)} 
            className="cursor-pointer text-gray-500 hover:text-gray-700 transition-colors"
          >
            <Filter className="h-5 w-5" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>{filtersVisible ? 'Hide filters' : 'Show filters'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className={cn(
      "fixed z-[100] top-4 left-4 right-4 flex flex-col",
      "animate-fade-in duration-300",
      // Hide the floating search bar on mobile when the sidebar is open
      isMobile && openMobile ? "opacity-0 pointer-events-none" : "opacity-100",
      className
    )}>
      <div className="flex w-full items-center">
        <div className="flex flex-1 items-center gap-2">
          <div className="flex-1 sm:max-w-[25%]"> {/* Limited width on desktop */}
            <EnhancedSearchBar 
              onVenueSelect={handleVenueSelect}
              className="shadow-lg w-full"
              leftIcon={<SidebarToggleButton />}
              rightIcon={<FilterToggleButton />}
              selectedVenue={selectedVenue}
            />
          </div>
          {filtersVisible && (
            <MapFilters 
              activeFilters={activeFilters} 
              onFilterChange={onFilterChange} 
              className="hidden sm:flex"
            />
          )}
        </div>
        {/* Notification center for authenticated users */}
        {user && (
          <div className="ml-2">
            <NotificationCenter />
          </div>
        )}
      </div>
      {/* Responsive filters for mobile */}
      {filtersVisible && (
        <div className="mt-2 sm:hidden">
          <MapFilters 
            activeFilters={activeFilters} 
            onFilterChange={onFilterChange} 
            className="justify-center"
          />
        </div>
      )}
    </div>
  );
};

export default FloatingSearchBar;
