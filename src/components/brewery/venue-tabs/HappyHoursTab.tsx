
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Venue } from '@/types/venue';
import { useVenueHappyHours } from '@/hooks/useVenueHappyHours';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import HappyHoursSection from '@/components/brewery/happy-hours/HappyHoursSection';
import { toast } from 'sonner';

interface HappyHoursTabProps {
  venue: Venue;
}

// Time options for the dropdown selectors
const HOURS = Array.from({ length: 24 }).map((_, hour) => {
  const hourStr = hour.toString().padStart(2, '0');
  return [
    { value: `${hourStr}:00`, label: `${hour === 0 ? 12 : hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}` },
    { value: `${hourStr}:30`, label: `${hour === 0 ? 12 : hour > 12 ? hour - 12 : hour}:30 ${hour >= 12 ? 'PM' : 'AM'}` }
  ];
}).flat();

export const HappyHoursTab = ({ venue }: HappyHoursTabProps) => {
  const { 
    happyHours, 
    isLoading, 
    updateHappyHours,
    isUpdating,
    error 
  } = useVenueHappyHours(venue.id);
  
  const handleSave = async (happyHoursData) => {
    try {
      const success = await updateHappyHours(happyHoursData);
      if (success) {
        toast.success('Happy hours updated successfully');
      }
      return success;
    } catch (error) {
      console.error('Error updating happy hours:', error);
      toast.error('Failed to update happy hours');
      return false;
    }
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Happy Hours</CardTitle>
          <CardDescription>
            Loading happy hours...
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
          <CardTitle>Happy Hours</CardTitle>
          <CardDescription>
            Error loading happy hours
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Failed to load happy hours. Please try again.</p>
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
        <CardTitle>Happy Hours</CardTitle>
        <CardDescription>
          Set your venue's happy hour schedule and special pricing periods
        </CardDescription>
      </CardHeader>
      <CardContent>
        <HappyHoursSection
          venueId={venue.id}
          happyHours={happyHours}
          HOURS={HOURS}
          onSave={handleSave}
          isUpdating={isUpdating}
        />
      </CardContent>
    </Card>
  );
};
