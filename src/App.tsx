
import React, { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import RegularDashboard from "./pages/dashboard/RegularDashboard";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import VenuesPage from "./pages/dashboard/VenuesPage";
import SettingsPage from "./pages/dashboard/SettingsPage";
import FavoritesPage from "./pages/dashboard/FavoritesPage";
import CheckInHistoryPage from "./pages/dashboard/CheckInHistoryPage";
import DiscoveriesPage from "./pages/dashboard/DiscoveriesPage";
import SubscriptionPage from "./pages/dashboard/SubscriptionPage";
import AdminRoute from "./components/protected/AdminRoute";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/Index";
import ClaimsManagement from "./pages/admin/Claims";
import BreweriesManagement from "./pages/admin/Breweries";
import UsersManagement from "./pages/admin/Users";
import { useWindowFocus } from "./hooks/useWindowFocus";
import { refreshSupabaseConnection } from "./integrations/supabase/connection";
import { useAuth } from "./contexts/AuthContext";

// Route component to conditionally render based on user type
const UserTypeRoute = ({ 
  element, 
  businessElement, 
  regularElement 
}) => {
  const { userType, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (userType === 'business') {
    return businessElement;
  } else if (userType === 'regular') {
    return regularElement;
  }
  
  return element;
};

const App = () => {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: 1,
      },
    },
  }));
  
  const isWindowFocused = useWindowFocus();
  
  // Handle window focus changes
  useEffect(() => {
    if (isWindowFocused) {
      // When window regains focus, refresh Supabase connection
      refreshSupabaseConnection();
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries();
    }
  }, [isWindowFocused, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              
              {/* Dashboard Routes with Sidebar Layout */}
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={
                  <UserTypeRoute 
                    element={<Navigate to="/" />}
                    businessElement={<Dashboard />}
                    regularElement={<RegularDashboard />}
                  />
                } />
                
                {/* Business user routes */}
                <Route path="breweries" element={<Dashboard />} />
                <Route path="venues" element={<VenuesPage />} />
                
                {/* Regular user routes */}
                <Route path="favorites" element={<FavoritesPage />} />
                <Route path="history" element={<CheckInHistoryPage />} />
                <Route path="discoveries" element={<DiscoveriesPage />} />
                <Route path="subscription" element={<SubscriptionPage />} />
                
                {/* Common routes */}
                <Route path="settings" element={<SettingsPage />} />
              </Route>
              
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminRoute />}>
                <Route element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="claims" element={<ClaimsManagement />} />
                  <Route path="breweries" element={<BreweriesManagement />} />
                  <Route path="users" element={<UsersManagement />} />
                </Route>
              </Route>
              
              <Route path="/" element={<Index />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
