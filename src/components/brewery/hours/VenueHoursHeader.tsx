
import React from 'react';
import { Utensils } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface VenueHoursHeaderProps {
  hasKitchen: boolean;
  onHasKitchenToggle: (value: boolean) => void;
}

const VenueHoursHeader = ({ hasKitchen, onHasKitchenToggle }: VenueHoursHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Utensils className="h-4 w-4" />
        <span className="font-medium">This venue has a kitchen</span>
      </div>
      <Switch 
        checked={hasKitchen}
        onCheckedChange={onHasKitchenToggle}
      />
    </div>
  );
};

export default VenueHoursHeader;
