
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import UnifiedSidebar from '@/components/sidebar/UnifiedSidebar';
import Header from '@/components/layout/Header';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import BottomNavigation from '@/components/navigation/BottomNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { FloatingSidebarToggle } from '@/components/ui/FloatingSidebarToggle';
import { useBreweryClaimNotifications } from '@/hooks/useBreweryClaimNotifications';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePWADetection } from '@/hooks/usePWADetection';
import { VenueSidebarProvider } from '@/contexts/VenueSidebarContext';

const AppLayout = () => {
  const { user, userType, firstName, lastName } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { isPWA } = usePWADetection();
  
  const isDashboardRoute = location.pathname.includes('/dashboard');
  const isAdminRoute = location.pathname.includes('/admin');
  const isRootRoute = location.pathname === '/';
  const isBusinessUserDashboard = isDashboardRoute && userType === 'business';
  const isRegularUserDashboard = isDashboardRoute && userType === 'regular';
  
  // Initialize brewery claim notifications for business users
  useBreweryClaimNotifications();
  
  const displayName = firstName || lastName 
    ? `${firstName || ''} ${lastName || ''}`.trim()
    : userType === 'business' 
      ? 'Business Owner' 
      : userType === 'admin' 
        ? 'Admin' 
        : 'User';

  // Determine if we should show bottom navigation and adjust layout
  const showBottomNav = isMobile && isPWA;
  const bottomNavHeight = showBottomNav ? 'pb-16' : '';
  
  return (
    <VenueSidebarProvider>
      <SidebarProvider defaultOpen={false}>
        <div className="flex w-full min-h-screen">
          <UnifiedSidebar />
          
          <div className={`h-screen overflow-auto flex-1 ${bottomNavHeight}`}>
            {isBusinessUserDashboard || isRegularUserDashboard ? (
              <div className="flex-1 flex flex-col">
                <DashboardHeader displayName={displayName} />
                <main className="p-6 pt-4 flex-1">
                  <Outlet />
                </main>
              </div>
            ) : isAdminRoute ? (
              <main className="flex-1 flex flex-col">
                <Outlet />
              </main>
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
          
          <BottomNavigation />
        </div>
      </SidebarProvider>
    </VenueSidebarProvider>
  );
};

export default AppLayout;
