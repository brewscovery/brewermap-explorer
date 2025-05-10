import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Clock } from 'lucide-react';
import { useVenueHours } from '@/hooks/useVenueHours';
import { useVenueHappyHours } from '@/hooks/useVenueHappyHours';
import { useVenueDailySpecials } from '@/hooks/useVenueDailySpecials';
import type { Venue } from '@/types/venue';
import { generateHourOptions } from './hoursUtils';
import HoursDialogTabs from './HoursDialogTabs';
import RegularHoursTab from './RegularHoursTab';
import HappyHoursTab from '../happy-hours/HappyHoursTab';
import DailySpecialsTab from '../daily-specials/DailySpecialsTab';
import { TabContentLoader } from './TabContentLoader';

interface VenueHoursDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  venue: Venue | null;
}

const VenueHoursDialog = ({ 
  open, 
  onOpenChange,
  venue
}: VenueHoursDialogProps) => {
  const [formData, setFormData] = useState<Array<any>>([]);
  const [hasKitchen, setHasKitchen] = useState<boolean>(true);
  const [kitchenClosedDays, setKitchenClosedDays] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState<'regular' | 'happy' | 'daily'>('regular');
  
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

  const {
    dailySpecials,
    isLoading: isLoadingDailySpecials,
    isUpdating: isUpdatingDailySpecials,
    updateDailySpecials
  } = useVenueDailySpecials(venue?.id || null);

  // Check if venue has any kitchen hours set when hours are loaded
  useEffect(() => {
    if (hours) {
      const venueHasKitchen = hours.some(
        hour => hour.kitchen_open_time !== null || hour.kitchen_close_time !== null
      );
      setHasKitchen(venueHasKitchen);
    }
  }, [hours]);
  
  const HOURS = generateHourOptions();

  if (!venue) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Operating Hours for {venue.name}
          </DialogTitle>
        </DialogHeader>
        
        <HoursDialogTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <div className="flex-1 overflow-hidden">
          <TabContentLoader
            activeTab={activeTab}
            isLoading={activeTab === 'regular' ? isLoading : 
                      activeTab === 'happy' ? isLoadingHappyHours : 
                      isLoadingDailySpecials}
          >
            {activeTab === 'regular' && (
              <RegularHoursTab
                hours={hours}
                formData={formData}
                setFormData={setFormData}
                hasKitchen={hasKitchen}
                setHasKitchen={setHasKitchen}
                kitchenClosedDays={kitchenClosedDays}
                setKitchenClosedDays={setKitchenClosedDays}
                HOURS={HOURS}
                venueId={venue.id}
                isUpdating={isUpdating}
                updateVenueHours={updateVenueHours}
              />
            )}
            
            {activeTab === 'happy' && (
              <HappyHoursTab
                venueId={venue.id}
                happyHours={happyHours}
                HOURS={HOURS}
                onSave={updateHappyHours}
                isUpdating={isUpdatingHappyHours}
              />
            )}
            
            {activeTab === 'daily' && (
              <DailySpecialsTab
                venueId={venue.id}
                dailySpecials={dailySpecials}
                HOURS={HOURS}
                onSave={updateDailySpecials}
                isUpdating={isUpdatingDailySpecials}
              />
            )}
          </TabContentLoader>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VenueHoursDialog;
