
import React from 'react';
import { Clock, Utensils } from 'lucide-react';

interface VenueHoursLegendProps {
  hasKitchen: boolean;
}

const VenueHoursLegend = ({ hasKitchen }: VenueHoursLegendProps) => {
  return (
    <div className="grid grid-cols-[130px_1fr] gap-4 mt-4">
      <div></div>
      <div className="grid grid-cols-2 gap-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock size={14} />
          <span>Venue hours</span>
        </div>
        {hasKitchen && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Utensils size={14} />
            <span>Kitchen hours</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default VenueHoursLegend;
