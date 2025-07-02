
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PanelLeft, Map, User, ChevronDown, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useSidebar } from '@/components/ui/sidebar';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import AppLogo from '@/components/ui/AppLogo';
import { useAuth } from '@/contexts/AuthContext';
import { useBreweryFetching } from '@/hooks/useBreweryFetching';
import CreateBreweryDialog from '@/components/brewery/CreateBreweryDialog';
import { BrewerySelector } from '@/components/dashboard/sidebar/brewery-selector/BrewerySelector';
import { LoadingState } from '@/components/dashboard/sidebar/brewery-selector/LoadingState';
import { EmptyState } from '@/components/dashboard/sidebar/brewery-selector/EmptyState';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface DashboardHeaderProps {
  displayName: string;
}

const DashboardHeader = ({ displayName }: DashboardHeaderProps) => {
  const navigate = useNavigate();
  const { toggleSidebar } = useSidebar();
  const { user, userType } = useAuth();
  const [isCreateBreweryDialogOpen, setIsCreateBreweryDialogOpen] = useState(false);
  
  const { 
    breweries, 
    selectedBrewery, 
    isLoading: breweriesLoading,
    setSelectedBrewery
  } = useBreweryFetching(userType === 'business' ? user?.id : null);

  const handleAddBrewery = () => {
    setIsCreateBreweryDialogOpen(true);
  };
  
  const handleBreweryCreated = () => {
    console.log('Brewery created successfully');
  };

  const handleBrewerySelect = (brewery: any) => {
    setSelectedBrewery(brewery);
  };
  
  return (
    <div className="p-4 bg-background/80 backdrop-blur-sm border-b flex items-center justify-between sticky top-0 z-10">
      {/* Left section - Logo */}
      <div className="cursor-pointer" onClick={toggleSidebar}>
        <AppLogo size="small" />
      </div>
      
      {/* Center section - Brewery Selector for Business Users */}
      <div className="flex-1 flex justify-center">
        {userType === 'business' && (
          <div className="flex items-center">
            {breweriesLoading ? (
              <LoadingState />
            ) : breweries.length === 0 ? (
              <EmptyState onAddBrewery={handleAddBrewery} />
            ) : (
              <BrewerySelector
                selectedBrewery={selectedBrewery}
                breweries={breweries}
                onBrewerySelect={handleBrewerySelect}
                onAddBrewery={handleAddBrewery}
              />
            )}
          </div>
        )}
      </div>

      {/* Right section - Notifications */}
      <div className="flex items-center gap-4">
        <NotificationCenter />
      </div>
      
      {/* Create Brewery Dialog */}
      {userType === 'business' && (
        <CreateBreweryDialog 
          open={isCreateBreweryDialogOpen} 
          onOpenChange={setIsCreateBreweryDialogOpen}
          onSuccess={handleBreweryCreated}
        />
      )}
    </div>
  );
};

export default DashboardHeader;
