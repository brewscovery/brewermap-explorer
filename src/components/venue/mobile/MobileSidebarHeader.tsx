
import React from 'react';
import { X, Heart, Plus, MapPin, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Venue } from '@/types/venue';
import type { Brewery } from '@/types/brewery';
import { VenueSidebarDisplayMode } from '../VenueSidebar';
import { useAuth } from '@/contexts/AuthContext';

interface MobileSidebarHeaderProps {
  venue: Venue;
  breweryInfo: Brewery | null;
  onClose: () => void;
  displayMode?: VenueSidebarDisplayMode;
  onOpenCheckInDialog?: () => void;
  onOpenTodoListDialog?: () => void;
}

export const MobileSidebarHeader = ({ 
  venue, 
  breweryInfo, 
  onClose, 
  displayMode = 'full',
  onOpenCheckInDialog,
  onOpenTodoListDialog
}: MobileSidebarHeaderProps) => {
  const { user } = useAuth();

  return (
    <div className="bg-gradient-to-r from-brewscovery-teal to-brewscovery-blue text-white shadow-lg">
      {/* Drag indicator */}
      <div className="flex justify-center py-2">
        <ChevronDown size={20} className="text-brewscovery-cream/70" />
      </div>
      
      <div className="px-4 pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="text-lg font-bold text-white truncate">
              {venue.name}
            </h2>
            {breweryInfo && (
              <p className="text-sm text-brewscovery-cream/90 truncate">
                {breweryInfo.name}
              </p>
            )}
            {venue.address && (
              <div className="flex items-center mt-1 text-xs text-brewscovery-cream/80">
                <MapPin size={12} className="mr-1 flex-shrink-0" />
                <span className="truncate">{venue.address}</span>
              </div>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-red-500/20 hover:text-white flex-shrink-0"
          >
            <X size={18} />
          </Button>
        </div>
        
        {/* Action buttons for mobile */}
        {displayMode === 'full' && user && (
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenCheckInDialog}
              className="flex-1 text-white bg-brewscovery-orange/20 hover:bg-brewscovery-orange/30 border border-brewscovery-cream/30"
            >
              <Heart size={16} className="mr-1" />
              Check In
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenTodoListDialog}
              className="flex-1 text-white bg-brewscovery-orange/20 hover:bg-brewscovery-orange/30 border border-brewscovery-cream/30"
            >
              <Plus size={16} className="mr-1" />
              To List
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
