
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Beer, Tag } from 'lucide-react';

interface HoursDialogTabsProps {
  activeTab: 'regular' | 'happy' | 'daily';
  setActiveTab: (tab: 'regular' | 'happy' | 'daily') => void;
}

const HoursDialogTabs = ({ activeTab, setActiveTab }: HoursDialogTabsProps) => {
  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => setActiveTab(value as 'regular' | 'happy' | 'daily')}
      className="w-full my-4"
    >
      <TabsList className="grid grid-cols-3 w-full">
        <TabsTrigger value="regular" className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          <span className="hidden sm:inline">Regular Hours</span>
          <span className="sm:hidden">Hours</span>
        </TabsTrigger>
        <TabsTrigger value="happy" className="flex items-center gap-1">
          <Beer className="h-4 w-4" />
          <span className="hidden sm:inline">Happy Hours</span>
          <span className="sm:hidden">Happy Hr</span>
        </TabsTrigger>
        <TabsTrigger value="daily" className="flex items-center gap-1">
          <Tag className="h-4 w-4" />
          <span className="hidden sm:inline">Daily Specials</span>
          <span className="sm:hidden">Specials</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default HoursDialogTabs;
