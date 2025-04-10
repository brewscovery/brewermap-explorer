
import React from 'react';
import HoursSection from './HoursSection';

interface VenueHoursSectionProps {
  venueHours: any[];
  isLoadingHours: boolean;
}

const VenueHoursSection = ({ venueHours, isLoadingHours }: VenueHoursSectionProps) => {
  // Check if venue has any kitchen hours set
  const hasKitchenHours = venueHours.some(
    hour => hour.kitchen_open_time !== null || hour.kitchen_close_time !== null
  );
  
  return (
    <div className="space-y-2">
      <h3 className="font-medium text-sm">Hours</h3>
      {isLoadingHours ? (
        <p className="text-sm text-muted-foreground">Loading hours...</p>
      ) : venueHours.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hours available</p>
      ) : (
        <div className="space-y-3">
          <HoursSection title="Operating Hours" hours={venueHours} />
          {hasKitchenHours && (
            <HoursSection title="Kitchen Hours" hours={venueHours} showKitchenHours={true} />
          )}
        </div>
      )}
    </div>
  );
};

export default VenueHoursSection;
