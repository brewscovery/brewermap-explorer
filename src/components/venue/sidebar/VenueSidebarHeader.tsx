
import React from 'react';
import { X, Heart, Plus, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Venue } from '@/types/venue';
import type { Brewery } from '@/types/brewery';
import { VenueSidebarDisplayMode } from '../VenueSidebar';
import { useAuth } from '@/contexts/AuthContext';

interface VenueSidebarHeaderProps {
  venue: Venue;
  venueName: string;
  breweryInfo: Brewery | null;
  onClose: () => void;
  displayMode?: VenueSidebarDisplayMode;
  onOpenCheckInDialog?: () => void;
  onOpenTodoListDialog?: () => void;
}

export const VenueSidebarHeader = ({ 
  venue, 
  venueName, 
  breweryInfo, 
  onClose, 
  displayMode = 'full',
  onOpenCheckInDialog,
  onOpenTodoListDialog
}: VenueSidebarHeaderProps) => {
  const { user } = useAuth();

  return (
    <div className="sticky top-0 z-10 bg-gradient-to-r from-brewscovery-teal to-brewscovery-blue shadow-lg border-b-2 border-brewscovery-orange">
      <div className="flex items-center justify-between p-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-white truncate">
            {venueName}
          </h2>
          {breweryInfo && (
            <p className="text-sm text-brewscovery-cream/90 truncate">
              {breweryInfo.name}
            </p>
          )}
          {venue.address && (
            <div className="flex items-center mt-1 text-xs text-brewscovery-cream/80">
              <MapPin size={12} className="mr-1" />
              <span className="truncate">{venue.address}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          {displayMode === 'full' && user && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={onOpenCheckInDialog}
                className="text-white hover:bg-brewscovery-orange/20 hover:text-brewscovery-cream border border-brewscovery-cream/30"
              >
                <Heart size={16} className="mr-1" />
                Check In
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onOpenTodoListDialog}
                className="text-white hover:bg-brewscovery-orange/20 hover:text-brewscovery-cream border border-brewscovery-cream/30"
              >
                <Plus size={16} className="mr-1" />
                To List
              </Button>
            </>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-red-500/20 hover:text-white"
          >
            <X size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};
