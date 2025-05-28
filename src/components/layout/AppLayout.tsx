
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useSidebar } from "@/components/ui/sidebar";
import { useBreweryClaimNotifications } from '@/hooks/useBreweryClaimNotifications';
import { useVenueNotificationTriggers } from '@/hooks/useVenueNotificationTriggers';
import { supabase } from '@/integrations/supabase/client';
import UnifiedSidebar from '@/components/sidebar/UnifiedSidebar';

const AppLayout = ({ children }: { children?: React.ReactNode }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { open, isMobile, openMobile } = useSidebar();

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
    <div className="flex min-h-screen w-full">
      {/* Unified Sidebar */}
      <UnifiedSidebar />
      
      {/* Overlay for mobile */}
      {isMobile && openMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-[100]" 
          onClick={() => {}} 
        />
      )}

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${
        !isMobile && open ? 'ml-64' : 'ml-0'
      }`}>
        {children || <Outlet />}
      </div>
    </div>
  );
};

export default AppLayout;
