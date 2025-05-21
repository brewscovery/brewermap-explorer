
import React, { memo } from 'react';
import HoursSection from './HoursSection';
import LastUpdatedInfo from './LastUpdatedInfo';

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
  
  // Get the most recent update time and who updated it
  const getLastUpdatedInfo = () => {
    if (venueHours.length === 0) return { updatedAt: null, updatedByType: null };
    
    // Find the most recently updated hour
    const mostRecent = venueHours.reduce(
      (latest, current) => {
        if (!latest.updated_at) return current;
        if (!current.updated_at) return latest;
        
        return new Date(current.updated_at) > new Date(latest.updated_at) 
          ? current 
          : latest;
      }, 
      { updated_at: null }
    );
    
    return {
      updatedAt: mostRecent.updated_at,
      updatedByType: mostRecent.updated_by ? 'admin' : 'business'
    };
  };
  
  const { updatedAt, updatedByType } = getLastUpdatedInfo();
  
  console.log(`VenueHoursSection rendering with hours: ${venueHours.length}`);
  
  return (
    <div className="space-y-2">
      <div className="flex flex-col">
        <h3 className="font-medium text-sm">Hours</h3>
        <LastUpdatedInfo updatedAt={updatedAt} updatedByType={updatedByType} />
      </div>
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
});

// Display name for debugging
VenueHoursSection.displayName = 'VenueHoursSection';

export default VenueHoursSection;
