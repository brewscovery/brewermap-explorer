import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from "@/components/ui/sidebar";
import { MainNav } from "@/components/ui/main-nav";
import { siteConfig } from "@/config/site";
import { Link } from "@tanstack/react-router";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { toast } from "@/components/ui/toast";
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useSidebar } from "@/components/ui/sidebar";
import { useBreweryClaimNotifications } from '@/hooks/useBreweryClaimNotifications';
import { useVenueNotificationTriggers } from '@/hooks/useVenueNotificationTriggers';

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const isSmall = useMediaQuery('(max-width: 768px)');
  const { toggleSidebar, open, setOpen, isMobile, openMobile, setOpenMobile } = useSidebar();

  // Initialize mobile sidebar state based on screen size
  useEffect(() => {
    if (isSmall) {
      setOpenMobile(false);
    } else {
      setOpenMobile(false);
    }
  }, [isSmall, setOpenMobile]);

  // Handle brewery claim notifications
  useBreweryClaimNotifications();
  
  // Add notification triggers
  useVenueNotificationTriggers();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar className="bg-gray-50 border-r w-60 hidden md:block">
        <div className="flex flex-col h-full">
          <div className="px-4 py-6">
            <Link to="/">
              <span className="font-bold text-xl">{siteConfig.name}</span>
            </Link>
          </div>
          <MainNav className="flex-1 px-4" />
          <div className="p-4">
            <ThemeToggle />
            <ModeToggle />
            {user ? (
              <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => signOut(() => navigate('/'))}>
                Sign Out
              </Button>
            ) : (
              <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => navigate('/auth/sign-in')}>
                Sign In
              </Button>
            )}
          </div>
        </div>
      </Sidebar>

      {/* Mobile Sidebar */}
      {isMobile && (
        <Sidebar className={`fixed inset-y-0 left-0 z-50 w-60 bg-gray-50 border-r transform transition-transform duration-300 ease-in-out ${openMobile ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex flex-col h-full">
            <div className="px-4 py-6">
              <Link to="/">
                <span className="font-bold text-xl">{siteConfig.name}</span>
              </Link>
            </div>
            <MainNav className="flex-1 px-4" />
            <div className="p-4">
              <ThemeToggle />
              <ModeToggle />
              {user ? (
                <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => signOut(() => navigate('/'))}>
                  Sign Out
                </Button>
              ) : (
                <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => navigate('/auth/sign-in')}>
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </Sidebar>
      )}

      {/* Main Content */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
};

export default AppLayout;
