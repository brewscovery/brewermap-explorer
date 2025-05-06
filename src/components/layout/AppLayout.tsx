
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import UnifiedSidebar from '@/components/sidebar/UnifiedSidebar';
import Header from '@/components/layout/Header';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { useAuth } from '@/contexts/AuthContext';

const AppLayout = () => {
  const { user, userType, firstName, lastName } = useAuth();
  const location = useLocation();
  const isDashboardRoute = location.pathname.includes('/dashboard');
  const isRootRoute = location.pathname === '/';
  
  const displayName = firstName || lastName 
    ? `${firstName || ''} ${lastName || ''}`.trim()
    : userType === 'business' 
      ? 'Business Owner' 
      : userType === 'admin' 
        ? 'Admin' 
        : 'User';
  
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex w-full min-h-screen">
        <UnifiedSidebar />
        
        <div className="h-screen overflow-auto flex-1">
          {isDashboardRoute && user ? (
            <div className="flex-1 flex flex-col">
              <DashboardHeader displayName={displayName} />
              <main className="p-6 pt-4 flex-1">
                <Outlet />
              </main>
            </div>
          ) : isRootRoute ? (
            <main className="flex-1 flex flex-col h-full">
              <Outlet />
            </main>
          ) : (
            <div className="flex-1 flex flex-col h-full">
              <Header />
              <main className="flex-1 pt-[73px] flex flex-col h-[calc(100%-73px)]">
                <Outlet />
              </main>
            </div>
          )}
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
