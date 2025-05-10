
import React, { useState } from 'react';
import { useVenueHours } from '@/hooks/useVenueHours';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Venue } from '@/types/venue';
import { VenueHour } from '@/types/venueHours';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { DAYS_OF_WEEK } from '@/types/venueHours';
import { formatTimeForForm } from '@/components/brewery/hours/hoursUtils';
import { generateHourOptions } from '@/components/brewery/hours/hoursUtils';
import { Loader2 } from 'lucide-react';
import VenueHoursSection from '@/components/brewery/hours/VenueHoursSection';
import EmptyHoursState from '@/components/brewery/hours/EmptyHoursState';

interface VenueHoursTabProps {
  venue: Venue;
}

export const VenueHoursTab = ({ venue }: VenueHoursTabProps) => {
  const { 
    hours, 
    isLoading, 
    updateVenueHours, 
    isUpdating,
    error
  } = useVenueHours(venue.id);
  
  const [hasKitchen, setHasKitchen] = useState(true);
  
  // Check if any hours have kitchen hours set when hours are loaded
  React.useEffect(() => {
    if (hours) {
      const kitchenHoursExist = hours.some(h => 
        h.kitchen_open_time !== null || h.kitchen_close_time !== null
      );
      setHasKitchen(kitchenHoursExist);
    }
  }, [hours]);

  const HOURS = generateHourOptions();
  
  const handleSave = async (hoursData: Partial<VenueHour>[]) => {
    const formattedData = hoursData.map(day => ({
      ...day,
      venue_open_time: day.venue_open_time ? `${day.venue_open_time}:00` : null,
      venue_close_time: day.venue_close_time ? `${day.venue_close_time}:00` : null,
      kitchen_open_time: hasKitchen && day.kitchen_open_time ? `${day.kitchen_open_time}:00` : null,
      kitchen_close_time: hasKitchen && day.kitchen_close_time ? `${day.kitchen_close_time}:00` : null,
    }));
    
    return await updateVenueHours(formattedData);
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Venue & Kitchen Hours</CardTitle>
          <CardDescription>
            Loading hours...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Venue & Kitchen Hours</CardTitle>
          <CardDescription>
            Error loading hours
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Failed to load venue hours. Please try again.</p>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="mt-4"
          >
            Reload
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Venue & Kitchen Hours</CardTitle>
        <CardDescription>
          Set your venue's regular opening and closing times
        </CardDescription>
      </CardHeader>
      <CardContent>
        {hours.length === 0 ? (
          <EmptyHoursState />
        ) : (
          <VenueHoursSection
            venueId={venue.id}
            hours={hours}
            HOURS={HOURS}
            hasKitchen={hasKitchen}
            setHasKitchen={setHasKitchen}
            onSave={handleSave}
            isUpdating={isUpdating}
          />
        )}
      </CardContent>
    </Card>
  );
};
