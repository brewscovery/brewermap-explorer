
import React from 'react';

interface TabContentLoaderProps {
  activeTab: string;
  isLoading: boolean;
  children: React.ReactNode;
}

export const TabContentLoader: React.FC<TabContentLoaderProps> = ({ 
  activeTab, 
  isLoading, 
  children 
}) => {
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p>Loading {
          activeTab === 'regular' ? 'hours' : 
          activeTab === 'happy' ? 'happy hours' : 
          'daily specials'
        }...</p>
      </div>
    );
  }

  return <>{children}</>;
};
