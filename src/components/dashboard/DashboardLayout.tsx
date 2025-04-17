
import React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardSidebar from './DashboardSidebar';
import RegularUserSidebar from './RegularUserSidebar';
import DashboardHeader from './DashboardHeader';
import { useAuth } from '@/contexts/AuthContext';

const DashboardLayout = () => {
  const { user, userType, firstName, lastName } = useAuth();
  const displayName = firstName || lastName 
    ? `${firstName || ''} ${lastName || ''}`.trim()
    : userType === 'business' ? 'Business Owner' : 'User';

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {userType === 'business' ? (
          <DashboardSidebar />
        ) : (
          <RegularUserSidebar user={user} displayName={displayName} />
        )}
        <div className="flex-1 h-screen overflow-auto flex flex-col">
          <DashboardHeader displayName={displayName} />
          <main className="p-6 pt-4 flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
