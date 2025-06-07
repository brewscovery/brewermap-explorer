
import React, { memo } from 'react';
import HoursSection from './HoursSection';

interface VenueHoursSectionProps {
  venueHours: any[];
  isLoadingHours: boolean;
}

// Using React.memo to prevent unnecessary re-renders
const VenueHoursSection = memo(({ venueHours, isLoadingHours }: VenueHoursSectionProps) => {
  // Check if venue has any kitchen hours set
  const hasKitchenHours = venueHours.some(
    hour => hour.kitchen_open_time !== null || hour.kitchen_close_time !== null
  );
  
  console.log(`VenueHoursSection rendering with hours: ${venueHours.length}`);
  
  return (
    <div className="space-y-2">
      {isLoadingHours ? (
        <p className="text-sm text-muted-foreground">Loading hours...</p>
      ) : venueHours.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hours available</p>
      ) : (
        <div className="space-y-3">
          <HoursSection title="Venue Hours" hours={venueHours} />
          {hasKitchenHours && (
            <HoursSection title="Kitchen Hours" hours={venueHours} showKitchenHours={true} />
          )}
        </div>
      )}
    </div>
  );
});

// Display name for debugging
VenueHoursSection.displayName = 'VenueHoursSection';

export default VenueHoursSection;
