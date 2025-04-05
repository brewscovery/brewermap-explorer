
import React from 'react';

interface HoursDialogTabsProps {
  activeTab: 'regular' | 'happy';
  setActiveTab: (tab: 'regular' | 'happy') => void;
}

const HoursDialogTabs = ({ activeTab, setActiveTab }: HoursDialogTabsProps) => {
  return (
    <div className="flex border-b mb-4">
      <button
        className={`px-4 py-2 text-sm font-medium ${activeTab === 'regular' ? 'border-b-2 border-primary' : 'text-muted-foreground'}`}
        onClick={() => setActiveTab('regular')}
      >
        Regular Hours
      </button>
      <button
        className={`px-4 py-2 text-sm font-medium ${activeTab === 'happy' ? 'border-b-2 border-primary' : 'text-muted-foreground'}`}
        onClick={() => setActiveTab('happy')}
      >
        Happy Hours
      </button>
    </div>
  );
};

export default HoursDialogTabs;
