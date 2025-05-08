
import React, { useState } from 'react';
import EnhancedSearchBar from './EnhancedSearchBar';
import { cn } from '@/lib/utils';
import { PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import MapFilters from './MapFilters';
import LoginPopover from '@/components/auth/LoginPopover';
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  const { user, firstName, lastName } = useAuth();
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

  return (
    <div className={cn(
      "fixed z-[100] top-4 left-4 right-4 flex flex-col",
      "animate-fade-in duration-300",
      className
    )}>
      <div className="flex w-full items-center">
        <div className="flex flex-1 items-center gap-2">
          <div className="flex-1 sm:max-w-[25%]"> {/* Limited width on desktop */}
            <EnhancedSearchBar 
              onVenueSelect={handleVenueSelect}
              className="shadow-lg w-full"
              leftIcon={<SidebarToggleButton />}
            />
          </div>
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
