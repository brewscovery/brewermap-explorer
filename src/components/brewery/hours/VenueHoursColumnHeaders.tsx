
import React from 'react';

interface VenueHoursColumnHeadersProps {
  hasKitchen: boolean;
}

const VenueHoursColumnHeaders = ({ hasKitchen }: VenueHoursColumnHeadersProps) => {
  return (
    <div className="grid grid-cols-[130px_1fr] gap-4 font-medium px-4 py-2 bg-muted/40 rounded-md sticky top-0 z-10">
      <div>Day</div>
      <div className="grid grid-cols-2 gap-6">
        <div>Venue Hours</div>
        {hasKitchen && <div>Kitchen Hours</div>}
      </div>
    </div>
  );
};

export default VenueHoursColumnHeaders;
