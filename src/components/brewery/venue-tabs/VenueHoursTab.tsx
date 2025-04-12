
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
  
  const [formData, setFormData] = useState<VenueHour[]>([]);
  const [hasKitchen, setHasKitchen] = useState(true);
  
  // Initialize formData when hours are loaded
  React.useEffect(() => {
    if (hours) {
      // Format hours for the form (ensure all days are represented)
      const defaultHours = DAYS_OF_WEEK.map((_, index) => {
        const existingHour = hours.find(h => h.day_of_week === index);
        if (existingHour) return existingHour;
        
        // Create default hours for missing days
        return {
          id: `new-${index}`,
          venue_id: venue.id,
          day_of_week: index,
          venue_open_time: null,
          venue_close_time: null,
          kitchen_open_time: null,
          kitchen_close_time: null,
          is_closed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      });
      
      setFormData(defaultHours);
      
      // Check if any hours have kitchen hours set
      const kitchenHoursExist = hours.some(h => 
        h.kitchen_open_time !== null || h.kitchen_close_time !== null
      );
      setHasKitchen(kitchenHoursExist);
    }
  }, [hours, venue.id]);
  
  const handleHourChange = (dayIndex: number, field: keyof VenueHour, value: any) => {
    setFormData(prev => 
      prev.map(hour => 
        hour.day_of_week === dayIndex 
          ? { ...hour, [field]: value }
          : hour
      )
    );
  };
  
  const handleSubmit = async () => {
    try {
      // Format data for submission
      const hoursToUpdate = formData.map(hour => ({
        ...hour,
        // Convert time format if needed
        venue_open_time: formatTimeForForm(hour.venue_open_time),
        venue_close_time: formatTimeForForm(hour.venue_close_time),
        kitchen_open_time: formatTimeForForm(hour.kitchen_open_time),
        kitchen_close_time: formatTimeForForm(hour.kitchen_close_time)
      }));
      
      const success = await updateVenueHours(hoursToUpdate);
      if (success) {
        toast.success('Venue hours updated successfully');
      }
    } catch (error) {
      console.error('Error updating hours:', error);
      toast.error('Failed to update venue hours');
    }
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
          Set your venue and kitchen opening and closing times
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <VenueHoursColumnHeaders hasKitchen={hasKitchen} />
          <Separator />
          
          <div className="divide-y">
            {DAYS_OF_WEEK.map((day, index) => {
              const hourForDay = formData.find(h => h.day_of_week === index);
              if (!hourForDay) return null;
              
              return (
                <HoursRow
                  key={index}
                  day={day}
                  hourData={hourForDay}
                />
              );
            })}
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <Button 
            onClick={handleSubmit} 
            disabled={isUpdating}
          >
            {isUpdating ? 'Saving Hours...' : 'Save Hours'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
