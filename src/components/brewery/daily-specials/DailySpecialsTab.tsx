
import { VenueDailySpecial } from '@/hooks/useVenueDailySpecials';
import { ScrollArea } from '@/components/ui/scroll-area';
import DailySpecialsSection from './DailySpecialsSection';

interface DailySpecialsTabProps {
  venueId: string;
  dailySpecials: VenueDailySpecial[];
  HOURS: { value: string; label: string }[];
  onSave: (dailySpecialsData: Partial<VenueDailySpecial>[]) => Promise<boolean>;
  isUpdating: boolean;
}

const DailySpecialsTab = ({ 
  venueId, 
  dailySpecials, 
  HOURS, 
  onSave, 
  isUpdating 
}: DailySpecialsTabProps) => {
  return (
    <ScrollArea className="h-[calc(80vh-160px)] pr-4">
      <div className="px-1 py-4">
        <DailySpecialsSection 
          venueId={venueId}
          dailySpecials={dailySpecials}
          HOURS={HOURS}
          onSave={onSave}
          isUpdating={isUpdating}
        />
      </div>
    </ScrollArea>
  );
};

export default DailySpecialsTab;
