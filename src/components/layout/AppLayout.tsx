
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import UnifiedSidebar from '@/components/sidebar/UnifiedSidebar';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import Header from '@/components/layout/Header';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { useAuth } from '@/contexts/AuthContext';
import { FloatingSidebarToggle } from '@/components/ui/FloatingSidebarToggle';
import RegularUserSidebar from '@/components/dashboard/RegularUserSidebar';

const AppLayout = () => {
  const { user, userType, firstName, lastName } = useAuth();
  const location = useLocation();
  const isDashboardRoute = location.pathname.includes('/dashboard');
  
  const displayName = firstName || lastName 
    ? `${firstName || ''} ${lastName || ''}`.trim()
    : userType === 'business' 
      ? 'Business Owner' 
      : userType === 'admin' 
        ? 'Admin' 
        : 'User';
  
  // Determine which sidebar to render based on user type and route
  const renderSidebar = () => {
    if (!user) return <UnifiedSidebar />;
    
    if (isDashboardRoute) {
      if (userType === 'business') {
        return <DashboardSidebar />;
      } else if (userType === 'regular') {
        return <RegularUserSidebar user={user} displayName={displayName} />;
      }
    }
    
    return <UnifiedSidebar />;
  };
  
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex w-full min-h-screen">
        {renderSidebar()}
        
        {/* Main content area */}
        <div className="h-screen overflow-auto flex-1">
          {isDashboardRoute && user ? (
            <div className="flex-1 flex flex-col">
              <DashboardHeader displayName={displayName} />
              <main className="p-6 pt-4 flex-1">
                <Outlet />
              </main>
            </div>
          ) : (
            <div className="flex-1 flex flex-col h-full">
              <Header />
              <main className="flex-1 pt-[73px] flex flex-col h-[calc(100%-73px)]">
                <Outlet />
              </main>
            </div>
          )}
          <FloatingSidebarToggle />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
