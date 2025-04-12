
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Venue } from '@/types/venue';
import { useVenueDailySpecials } from '@/hooks/useVenueDailySpecials';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import DailySpecialsSection from '@/components/brewery/daily-specials/DailySpecialsSection';
import { toast } from 'sonner';

interface DailySpecialsTabProps {
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

export const DailySpecialsTab = ({ venue }: DailySpecialsTabProps) => {
  const { 
    dailySpecials, 
    isLoading, 
    updateDailySpecials,
    isUpdating,
    error 
  } = useVenueDailySpecials(venue.id);
  
  const handleSave = async (dailySpecialsData) => {
    try {
      const success = await updateDailySpecials(dailySpecialsData);
      if (success) {
        toast.success('Daily specials updated successfully');
      }
      return success;
    } catch (error) {
      console.error('Error updating daily specials:', error);
      toast.error('Failed to update daily specials');
      return false;
    }
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Daily Specials</CardTitle>
          <CardDescription>
            Loading daily specials...
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
          <CardTitle>Daily Specials</CardTitle>
          <CardDescription>
            Error loading daily specials
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Failed to load daily specials. Please try again.</p>
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
        <CardTitle>Daily Specials</CardTitle>
        <CardDescription>
          Set your venue's recurring daily specials and promotions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DailySpecialsSection
          venueId={venue.id}
          dailySpecials={dailySpecials}
          HOURS={HOURS}
          onSave={handleSave}
          isUpdating={isUpdating}
        />
      </CardContent>
    </Card>
  );
};
