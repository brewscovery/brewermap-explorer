
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PanelLeft, Map, User, ChevronDown, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useSidebar } from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import EnhancedSearchBar from '@/components/search/EnhancedSearchBar';
import { useVenueData } from '@/hooks/useVenueData';

interface DashboardHeaderProps {
  displayName: string;
}

const DashboardHeader = ({ displayName }: DashboardHeaderProps) => {
  const navigate = useNavigate();
  const { toggleSidebar } = useSidebar();
  const { setSelectedVenue } = useVenueData();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/');
      toast.success('Logged out successfully');
    } catch (error: any) {
      toast.error('Failed to logout. Please try again.');
    }
  };

  const handleVenueSelect = (venue) => {
    if (!venue) return;
    
    console.log('Venue selected from dashboard search:', venue);
    setSelectedVenue(venue);
    // When searching from dashboard, navigate to the main map view
    navigate('/');
  };
  
  return (
    <div className="p-4 bg-background/80 backdrop-blur-sm border-b flex items-center justify-between sticky top-0 z-10">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="mr-4"
      >
        <PanelLeft className="h-4 w-4" />
        <span className="sr-only">Toggle Sidebar</span>
      </Button>

      <div className="flex-1 flex justify-center">
        <EnhancedSearchBar 
          onVenueSelect={handleVenueSelect} 
          className="max-w-md w-full"
        />
      </div>

      <div className="flex items-center gap-4 ml-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <User size={18} />
              <span>{displayName}</span>
              <ChevronDown size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => navigate('/')}>
              <Map className="mr-2" size={18} />
              View Map
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2" size={18} />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default DashboardHeader;
