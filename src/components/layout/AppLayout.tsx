
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import RegularUserSidebar from '@/components/dashboard/RegularUserSidebar';
import AdminSidebar from '@/components/admin/AdminSidebar';
import Header from '@/components/layout/Header';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
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
  
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex w-full min-h-screen">
        {/* Sidebars now use the fly-in animation style */}
        {user && userType === 'business' && !isAdminRoute && (
          <DashboardSidebar />
        )}
        {user && userType === 'regular' && !isAdminRoute && (
          <RegularUserSidebar user={user} displayName={displayName} />
        )}
        {user && userType === 'admin' && !isAdminRoute && (
          <AdminSidebar />
        )}
        
        {/* Main content area - always the same structure */}
        <div className="h-screen overflow-auto flex-1">
          {isDashboardRoute && user ? (
            // Dashboard routes
            <div className="flex-1 flex flex-col">
              <DashboardHeader displayName={displayName} />
              <main className="p-6 pt-4 flex-1">
                <Outlet />
              </main>
            </div>
          ) : (
            // Regular routes
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

