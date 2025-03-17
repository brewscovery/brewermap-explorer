
import React from 'react';
import { MapPin } from 'lucide-react';
import type { Venue } from '@/types/venue';

interface AddressSectionProps {
  venue: Venue;
}

const AddressSection = ({ venue }: AddressSectionProps) => {
  return (
    <div className="space-y-2">
      <h3 className="font-medium text-sm">Address</h3>
      <div className="flex items-start gap-2">
        <MapPin size={16} className="text-muted-foreground mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          {venue.street && <p>{venue.street}</p>}
          <p>{venue.city}, {venue.state} {venue.postal_code || ''}</p>
          {venue.country && venue.country !== 'United States' && <p>{venue.country}</p>}
        </div>
      </div>
    </div>
  );
};

export default AddressSection;
