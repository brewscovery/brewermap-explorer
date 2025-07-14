
import { ScrollArea } from '@/components/ui/scroll-area';
import type { VenueHour } from '@/types/venueHours';
import VenueHoursSection from './VenueHoursSection';

interface RegularHoursTabProps {
  hours: VenueHour[];
  formData: Array<Partial<VenueHour>>;
  setFormData: React.Dispatch<React.SetStateAction<Array<Partial<VenueHour>>>>;
  hasKitchen: boolean;
  setHasKitchen: (value: boolean) => void;
  kitchenClosedDays: Set<number>;
  setKitchenClosedDays: React.Dispatch<React.SetStateAction<Set<number>>>;
  HOURS: { value: string; label: string }[];
  venueId: string;
  isUpdating: boolean;
  updateVenueHours: (hours: Partial<VenueHour>[]) => Promise<boolean>;
}

const RegularHoursTab = ({
  hours,
  hasKitchen,
  setHasKitchen,
  HOURS,
  venueId,
  isUpdating,
  updateVenueHours
}: RegularHoursTabProps) => {
  
  const handleSave = async (hoursData: Partial<VenueHour>[]) => {
    const formattedData = hoursData.map(day => ({
      ...day, // This preserves the id and other fields
      venue_open_time: day.venue_open_time ? `${day.venue_open_time}:00` : null,
      venue_close_time: day.venue_close_time ? `${day.venue_close_time}:00` : null,
      kitchen_open_time: hasKitchen && day.kitchen_open_time ? `${day.kitchen_open_time}:00` : null,
      kitchen_close_time: hasKitchen && day.kitchen_close_time ? `${day.kitchen_close_time}:00` : null,
    }));
    
    console.log('[DEBUG] RegularHoursTab sending data with IDs:', formattedData);
    return await updateVenueHours(formattedData);
  };

  return (
    <ScrollArea className="h-[calc(80vh-160px)] pr-4">
      <div className="px-1 py-4">
        <VenueHoursSection
          venueId={venueId}
          hours={hours}
          HOURS={HOURS}
          hasKitchen={hasKitchen}
          setHasKitchen={setHasKitchen}
          onSave={handleSave}
          isUpdating={isUpdating}
        />
      </div>
    </ScrollArea>
  );
};

export default RegularHoursTab;
