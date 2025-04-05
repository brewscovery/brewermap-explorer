
import { VenueHappyHour } from '@/hooks/useVenueHappyHours';
import { ScrollArea } from '@/components/ui/scroll-area';
import HappyHoursSection from './HappyHoursSection';

interface HappyHoursTabProps {
  venueId: string;
  happyHours: VenueHappyHour[];
  HOURS: { value: string; label: string }[];
  onSave: (happyHoursData: Partial<VenueHappyHour>[]) => Promise<boolean>;
  isUpdating: boolean;
}

const HappyHoursTab = ({ 
  venueId, 
  happyHours, 
  HOURS, 
  onSave, 
  isUpdating 
}: HappyHoursTabProps) => {
  return (
    <ScrollArea className="h-[calc(80vh-160px)] pr-4">
      <div className="px-1 py-4">
        <HappyHoursSection 
          venueId={venueId}
          happyHours={happyHours}
          HOURS={HOURS}
          onSave={onSave}
          isUpdating={isUpdating}
        />
      </div>
    </ScrollArea>
  );
};

export default HappyHoursTab;
