
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
import AdminRoute from "./components/protected/AdminRoute";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/Index";
import ClaimsManagement from "./pages/admin/Claims";
import BreweriesManagement from "./pages/admin/Breweries";
import UsersManagement from "./pages/admin/Users";
import { useWindowFocus } from "./hooks/useWindowFocus";
import { refreshSupabaseConnection } from "./integrations/supabase/connection";

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
              <Route path="/dashboard" element={<Dashboard />} />
              
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
