
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useSidebar } from "@/components/ui/sidebar";
import { useBreweryClaimNotifications } from '@/hooks/useBreweryClaimNotifications';
import { useVenueNotificationTriggers } from '@/hooks/useVenueNotificationTriggers';
import { supabase } from '@/integrations/supabase/client';

const AppLayout = ({ children }: { children?: React.ReactNode }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { toggleSidebar, open, setOpen, isMobile, openMobile, setOpenMobile } = useSidebar();

  // Handle sign out
  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: "Error",
          description: "Failed to sign out",
          variant: "destructive",
        });
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: "Error", 
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

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
            <span className="font-bold text-xl">BreweryApp</span>
          </div>
          <div className="flex-1 px-4">
            {/* Navigation menu will go here */}
          </div>
          <div className="p-4">
            {user ? (
              <Button variant="outline" size="sm" className="w-full mt-2" onClick={handleSignOut}>
                Sign Out
              </Button>
            ) : (
              <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => navigate('/auth')}>
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
              <span className="font-bold text-xl">BreweryApp</span>
            </div>
            <div className="flex-1 px-4">
              {/* Navigation menu will go here */}
            </div>
            <div className="p-4">
              {user ? (
                <Button variant="outline" size="sm" className="w-full mt-2" onClick={handleSignOut}>
                  Sign Out
                </Button>
              ) : (
                <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => navigate('/auth')}>
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </Sidebar>
      )}

      {/* Main Content */}
      <div className="flex-1">
        {children || <Outlet />}
      </div>
    </div>
  );
};

export default AppLayout;
