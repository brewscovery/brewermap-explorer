
import React from 'react';
import HoursSection from './HoursSection';

interface VenueHoursSectionProps {
  venueHours: any[];
  isLoadingHours: boolean;
}

const VenueHoursSection = ({ venueHours, isLoadingHours }: VenueHoursSectionProps) => {
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
          <HoursSection title="Kitchen Hours" hours={venueHours} showKitchenHours={true} />
        </div>
      )}
    </div>
  );
};

export default VenueHoursSection;
