
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import RegularUserSidebar from '@/components/dashboard/RegularUserSidebar';
import Header from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';

const AppLayout = () => {
  const { user, userType, firstName, lastName } = useAuth();
  const location = useLocation();
  const isDashboardRoute = location.pathname.includes('/dashboard');
  const isAdminRoute = location.pathname.includes('/admin');
  
  // Display name logic for the header
  const displayName = firstName || lastName 
    ? `${firstName || ''} ${lastName || ''}`.trim()
    : userType === 'business' 
      ? 'Business Owner' 
      : userType === 'admin' 
        ? 'Admin' 
        : 'User';
  
  // If user is not authenticated, render without sidebar
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col h-screen">
        <Header />
        <main className="flex-1 pt-[73px] flex flex-col h-[calc(100%-73px)]">
          <Outlet />
        </main>
      </div>
    );
  }

  // For authenticated users, render with the appropriate sidebar
  return (
    <SidebarProvider defaultOpen={false}>  {/* Default to collapsed sidebar */}
      <div className="min-h-screen flex w-full h-screen">
        {userType === 'business' ? (
          <DashboardSidebar />
        ) : userType === 'admin' ? (
          null  // Admin has its own layout with sidebar
        ) : (
          <RegularUserSidebar user={user} displayName={displayName} />
        )}
        <div className="flex-1 h-screen overflow-auto flex flex-col">
          {isDashboardRoute ? (
            // Use DashboardHeader for dashboard routes
            <div className="flex-1 flex flex-col">
              <Outlet />
            </div>
          ) : (
            // Use regular Header for non-dashboard routes
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
