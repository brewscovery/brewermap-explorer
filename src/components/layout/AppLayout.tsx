
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useBreweryClaimNotifications } from '@/hooks/useBreweryClaimNotifications';
import { useVenueNotificationTriggers } from '@/hooks/useVenueNotificationTriggers';
import { supabase } from '@/integrations/supabase/client';
import UnifiedSidebar from '@/components/sidebar/UnifiedSidebar';

const AppLayout = ({ children }: { children?: React.ReactNode }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

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

  // Handle brewery claim notifications (only for authenticated users)
  useBreweryClaimNotifications();
  
  // Add notification triggers (only for authenticated users)
  useVenueNotificationTriggers();

  // Only show sidebar for authenticated users
  if (!user) {
    return (
      <div className="w-full">
        {children || <Outlet />}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full">
      {/* Unified Sidebar - only for authenticated users */}
      <UnifiedSidebar />
      
      {/* Main Content */}
      <div className="flex-1">
        {children || <Outlet />}
      </div>
    </div>
  );
};

export default AppLayout;
