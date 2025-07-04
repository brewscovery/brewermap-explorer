import React, { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { InvalidationProvider } from "@/contexts/InvalidationContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { RealtimeProvider } from "./contexts/RealtimeContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import RegularDashboard from "./pages/dashboard/RegularDashboard";
import VenuesPage from "./pages/dashboard/VenuesPage";
import SettingsPage from "./pages/dashboard/SettingsPage";
import FavoritesPage from "./pages/dashboard/FavoritesPage";
import DiscoveriesPage from "./pages/dashboard/DiscoveriesPage";
import SubscriptionPage from "./pages/dashboard/SubscriptionPage";
import AdminRoute from "./components/protected/AdminRoute";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/Index";
import ClaimsManagement from "./pages/admin/Claims";
import BreweriesManagement from "./pages/admin/Breweries";
import BreweryImport from "./pages/admin/BreweryImport";
import UsersManagement from "./pages/admin/Users";
import { useWindowFocus } from "./hooks/useWindowFocus";
import { refreshSupabaseConnection } from "./integrations/supabase/connection";
import { useAuth } from "./contexts/AuthContext";
import AppLayout from "./components/layout/AppLayout";
import AdminContentLayout from "./components/admin/AdminContentLayout";
import EventsPage from "./pages/dashboard/EventsPage";
import TodoListsPage from "./pages/dashboard/TodoListsPage";
import EventsExplorer from "./pages/dashboard/EventsExplorer";
import ProtectedRoute from "./components/protected/ProtectedRoute";
import VenueQrRedirect from "./components/qr/VenueQrRedirect";
import PWAInstallPrompt from './components/PWAInstallPrompt';
//import './App.css';

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
      <InvalidationProvider>
        <AuthProvider>
          <RealtimeProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/qr-checkin/:token" element={<VenueQrRedirect />} />
                
                <Route element={<AppLayout />}>
                  <Route path="/" element={<Index />} />
                  
                  {/* Protected Dashboard Routes */}
                  <Route element={<ProtectedRoute />}>
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
                      <Route path="eventsExplorer" element={<EventsExplorer />} />
                      <Route path="todoLists" element={<TodoListsPage />} />
                      <Route path="discoveries" element={<DiscoveriesPage />} />
                      <Route path="subscription" element={<SubscriptionPage />} />
                      
                      <Route path="settings" element={<SettingsPage />} />
                    </Route>
                  </Route>
                  
                  {/* Admin Routes (already protected by AdminRoute component) */}
                  <Route path="/admin" element={<AdminRoute />}>
                    <Route element={<AdminContentLayout />}>
                      <Route index element={<AdminDashboard />} />
                      <Route path="claims" element={<ClaimsManagement />} />
                      <Route path="breweries" element={<BreweriesManagement />} />
                      <Route path="brewery-import" element={<BreweryImport />} />
                      <Route path="users" element={<UsersManagement />} />
                    </Route>
                  </Route>
                </Route>
              </Routes>
              <PWAInstallPrompt/>
            </TooltipProvider>
          </RealtimeProvider>
        </AuthProvider>
      </InvalidationProvider>
    </QueryClientProvider>
  );
};

export default App;