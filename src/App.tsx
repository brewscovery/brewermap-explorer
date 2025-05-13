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
import AppLayout from "./components/layout/AppLayout";
import AdminContentLayout from "./components/admin/AdminContentLayout";
import EventsPage from "./pages/dashboard/EventsPage";
import TodoListsPage from "./pages/dashboard/TodoListsPage"

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
  
  useEffect(() => {
    if (isWindowFocused) {
      refreshSupabaseConnection();
      // Only refresh data queries, don't force map refresh
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          // Don't invalidate map-related queries on window focus
          return !query.queryKey.some(key => 
            typeof key === 'string' && 
            (key.includes('map') || key.includes('venue') || key.includes('brewery'))
          );
        }
      });
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
              
              <Route element={<AppLayout />}>
                <Route path="/" element={<Index />} />
                
                <Route path="/dashboard">
                  <Route index element={
                    <UserTypeRoute 
                      element={<Navigate to="/" />}
                      businessElement={<Dashboard />}
                      regularElement={<RegularDashboard />}
                    />
                  } />
                  
                  <Route path="breweries" element={<Dashboard />} />
                  <Route path="venues" element={<VenuesPage />} />
                  <Route path="events" element={<EventsPage />} />
                  
                  <Route path="favorites" element={<FavoritesPage />} />
                  <Route path="todoLists" element={<TodoListsPage />} />
                  <Route path="history" element={<CheckInHistoryPage />} />
                  <Route path="discoveries" element={<DiscoveriesPage />} />
                  <Route path="subscription" element={<SubscriptionPage />} />
                  
                  <Route path="settings" element={<SettingsPage />} />
                </Route>
                
                <Route path="/admin" element={<AdminRoute />}>
                  <Route element={<AdminContentLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="claims" element={<ClaimsManagement />} />
                    <Route path="breweries" element={<BreweriesManagement />} />
                    <Route path="users" element={<UsersManagement />} />
                  </Route>
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
