
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';
import { useVenueHours } from '@/hooks/useVenueHours';
import { useVenueHappyHours } from '@/hooks/useVenueHappyHours';
import { DAYS_OF_WEEK } from '@/types/venueHours';
import type { VenueHour } from '@/types/venueHours';
import type { Venue } from '@/types/venue';
import { formatTimeForForm, generateHourOptions } from './hours/hoursUtils';
import HoursDialogTabs from './hours/HoursDialogTabs';
import RegularHoursTab from './hours/RegularHoursTab';
import HappyHoursTab from './happy-hours/HappyHoursTab';

interface VenueHoursDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  venue: Venue | null;
}

const HOURS = generateHourOptions();

const VenueHoursDialog = ({ 
  open, 
  onOpenChange,
  venue
}: VenueHoursDialogProps) => {
  const [formData, setFormData] = useState<Array<Partial<VenueHour>>>([]);
  const [hasKitchen, setHasKitchen] = useState<boolean>(true);
  const [kitchenClosedDays, setKitchenClosedDays] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState<'regular' | 'happy'>('regular');
  
  const { 
    hours, 
    isLoading, 
    isUpdating, 
    updateVenueHours 
  } = useVenueHours(venue?.id || null);
  
  const {
    happyHours,
    isLoading: isLoadingHappyHours,
    isUpdating: isUpdatingHappyHours,
    updateHappyHours
  } = useVenueHappyHours(venue?.id || null);

  // Initialize or reset form data when dialog opens or venue changes
  useEffect(() => {
    if (open && venue) {
      console.log("Updating form with loaded hours:", hours);
      
      const initialData = DAYS_OF_WEEK.map((_, index) => {
        const existingHour = hours.find(h => h.day_of_week === index);
        
        if (existingHour) {
          return {
            ...existingHour,
            venue_open_time: formatTimeForForm(existingHour.venue_open_time),
            venue_close_time: formatTimeForForm(existingHour.venue_close_time),
            kitchen_open_time: formatTimeForForm(existingHour.kitchen_open_time),
            kitchen_close_time: formatTimeForForm(existingHour.kitchen_close_time),
          };
        }

        return {
          venue_id: venue.id,
          day_of_week: index,
          venue_open_time: '09:00',
          venue_close_time: '18:00',
          kitchen_open_time: '11:00',
          kitchen_close_time: '17:00',
          is_closed: index === 0, // Default to closed on Sundays
        };
      });
      
      setFormData(initialData);
      
      // Check if venue has any kitchen hours set
      const venueHasKitchen = hours.some(
        hour => hour.kitchen_open_time !== null || hour.kitchen_close_time !== null
      );
      setHasKitchen(venueHasKitchen || hours.length === 0);
      
      // Initialize kitchen closed days
      const closedKitchenDays = new Set<number>();
      hours.forEach(hour => {
        if (!hour.is_closed && hour.venue_open_time && hour.venue_close_time && 
            (!hour.kitchen_open_time || !hour.kitchen_close_time)) {
          closedKitchenDays.add(hour.day_of_week);
        }
      });
      setKitchenClosedDays(closedKitchenDays);
    }
  }, [open, venue, hours]);

  const handleSave = async () => {
    if (!venue) return;
    
    if (activeTab === 'regular') {
      const formattedData = formData.map(day => {
        const dayIndex = day.day_of_week as number;
        const isKitchenClosed = kitchenClosedDays.has(dayIndex);
        
        return {
          ...day,
          venue_open_time: day.venue_open_time ? `${day.venue_open_time}:00` : null,
          venue_close_time: day.venue_close_time ? `${day.venue_close_time}:00` : null,
          kitchen_open_time: hasKitchen && !isKitchenClosed && day.kitchen_open_time ? `${day.kitchen_open_time}:00` : null,
          kitchen_close_time: hasKitchen && !isKitchenClosed && day.kitchen_close_time ? `${day.kitchen_close_time}:00` : null,
        };
      });
      
      const success = await updateVenueHours(formattedData);
      if (success) {
        onOpenChange(false);
      }
    }
  };

  if (!venue) return null;

  const renderActiveTab = () => {
    if (isLoading) {
      return (
        <div className="text-center py-8">
          <p>Loading hours...</p>
        </div>
      );
    }

    if (activeTab === 'regular') {
      return (
        <RegularHoursTab
          hours={hours}
          formData={formData}
          setFormData={setFormData}
          hasKitchen={hasKitchen}
          setHasKitchen={setHasKitchen}
          kitchenClosedDays={kitchenClosedDays}
          setKitchenClosedDays={setKitchenClosedDays}
          HOURS={HOURS}
        />
      );
    } else {
      return (
        <HappyHoursTab
          venueId={venue.id}
          happyHours={happyHours}
          HOURS={HOURS}
          onSave={updateHappyHours}
          isUpdating={isUpdatingHappyHours}
        />
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Operating Hours for {venue.name}
          </DialogTitle>
        </DialogHeader>
        
        <HoursDialogTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <div className="flex-1 overflow-hidden">
          {renderActiveTab()}
        </div>
        
        <DialogFooter className="mt-6">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {activeTab === 'regular' && (
            <Button onClick={handleSave} disabled={isUpdating}>
              {isUpdating ? 'Saving...' : 'Save Hours'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VenueHoursDialog;
