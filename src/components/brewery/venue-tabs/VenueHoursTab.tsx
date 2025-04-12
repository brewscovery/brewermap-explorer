
import React, { useState } from 'react';
import { useVenueHours } from '@/hooks/useVenueHours';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Venue } from '@/types/venue';
import { VenueHour } from '@/types/venueHours';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { DAYS_OF_WEEK } from '@/types/venueHours';
import { formatTimeForForm } from '@/components/brewery/hours/hoursUtils';
import HoursRow from '@/components/brewery/hours/HoursRow';
import VenueHoursColumnHeaders from '@/components/brewery/hours/VenueHoursColumnHeaders';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
import VenueHoursDialog from '@/components/brewery/VenueHoursDialog';

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
  const [showHoursDialog, setShowHoursDialog] = useState(false);
  
  // Check if any hours have kitchen hours set when hours are loaded
  React.useEffect(() => {
    if (hours) {
      const kitchenHoursExist = hours.some(h => 
        h.kitchen_open_time !== null || h.kitchen_close_time !== null
      );
      setHasKitchen(kitchenHoursExist);
    }
  }, [hours]);
  
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
    <>
      <Card>
        <CardHeader>
          <CardTitle>Venue & Kitchen Hours</CardTitle>
          <CardDescription>
            View your venue and kitchen opening and closing times
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <VenueHoursColumnHeaders hasKitchen={hasKitchen} />
            <Separator />
            
            <div className="divide-y">
              {DAYS_OF_WEEK.map((day, index) => {
                const hourForDay = hours?.find(h => h.day_of_week === index);
                if (!hourForDay) return null;
                
                return (
                  <HoursRow
                    key={index}
                    day={day}
                    hourData={hourForDay}
                    dayIndex={index}
                  />
                );
              })}
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <Button 
              onClick={() => setShowHoursDialog(true)} 
              variant="outline"
            >
              Edit Hours
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <VenueHoursDialog
        open={showHoursDialog}
        onOpenChange={setShowHoursDialog}
        venue={venue}
      />
    </>
  );
};
