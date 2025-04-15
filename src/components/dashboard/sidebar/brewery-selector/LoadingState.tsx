
import React from 'react';
import { SidebarHeader } from '@/components/ui/sidebar';

export const LoadingState = () => {
  return (
    <SidebarHeader className="flex flex-col items-center p-4">
      <div className="w-full flex items-center space-x-3">
        <div className="animate-pulse h-10 w-10 bg-muted rounded-full"></div>
        <div className="animate-pulse h-4 w-32 bg-muted rounded"></div>
      </div>
    </SidebarHeader>
  );
};
