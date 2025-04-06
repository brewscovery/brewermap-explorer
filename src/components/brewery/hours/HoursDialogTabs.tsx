
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Beer, Clock, MenuSquare } from "lucide-react";

interface HoursDialogTabsProps {
  activeTab: 'regular' | 'happy' | 'daily';
  setActiveTab: (tab: 'regular' | 'happy' | 'daily') => void;
}

const HoursDialogTabs = ({ activeTab, setActiveTab }: HoursDialogTabsProps) => {
  return (
    <Tabs 
      value={activeTab} 
      onValueChange={(v) => setActiveTab(v as 'regular' | 'happy' | 'daily')}
      className="w-full"
    >
      <TabsList className="grid grid-cols-3 mb-4">
        <TabsTrigger value="regular" className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          <span>Regular Hours</span>
        </TabsTrigger>
        <TabsTrigger value="happy" className="flex items-center gap-1.5">
          <Beer className="h-4 w-4" />
          <span>Happy Hours</span>
        </TabsTrigger>
        <TabsTrigger value="daily" className="flex items-center gap-1.5">
          <MenuSquare className="h-4 w-4" />
          <span>Daily Specials</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default HoursDialogTabs;
