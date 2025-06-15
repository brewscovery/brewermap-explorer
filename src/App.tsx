
import './App.css';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClientProvider } from '@/contexts/QueryClientProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { RealtimeProvider } from '@/contexts/RealtimeContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ThemeProvider } from 'next-themes';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import AdminRoute from '@/components/protected/AdminRoute';
import ProtectedRoute from '@/components/protected/ProtectedRoute';

// Admin Pages
import AdminIndex from '@/pages/admin/Index';
import AdminBreweries from '@/pages/admin/Breweries';
import AdminClaims from '@/pages/admin/Claims';
import AdminUsers from '@/pages/admin/Users';
import BreweryImport from '@/pages/admin/BreweryImport';

// Dashboard Pages
import VenuesPage from '@/pages/dashboard/VenuesPage';
import SettingsPage from '@/pages/dashboard/SettingsPage';
import EventsPage from '@/pages/dashboard/EventsPage';
import FavoritesPage from '@/pages/dashboard/FavoritesPage';
import CheckInHistoryPage from '@/pages/dashboard/CheckInHistoryPage';
import DiscoveriesPage from '@/pages/dashboard/DiscoveriesPage';
import TodoListsPage from '@/pages/dashboard/TodoListsPage';
import EventsExplorer from '@/pages/dashboard/EventsExplorer';
import SubscriptionPage from '@/pages/dashboard/SubscriptionPage';

import AdminContentLayout from '@/components/admin/AdminContentLayout';
import AppLayout from '@/components/layout/AppLayout';

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <QueryClientProvider>
        <AuthProvider>
          <RealtimeProvider>
            <TooltipProvider>
              <SidebarProvider>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  
                  {/* Protected Routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route element={<AppLayout />}>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/dashboard/venues" element={<VenuesPage />} />
                      <Route path="/dashboard/settings" element={<SettingsPage />} />
                      <Route path="/dashboard/events" element={<EventsPage />} />
                      <Route path="/dashboard/favorites" element={<FavoritesPage />} />
                      <Route path="/dashboard/history" element={<CheckInHistoryPage />} />
                      <Route path="/dashboard/discoveries" element={<DiscoveriesPage />} />
                      <Route path="/dashboard/todoLists" element={<TodoListsPage />} />
                      <Route path="/dashboard/eventsExplorer" element={<EventsExplorer />} />
                      <Route path="/dashboard/subscription" element={<SubscriptionPage />} />
                    </Route>
                  </Route>

                  {/* Admin Routes */}
                  <Route element={<AdminRoute />}>
                    <Route element={<AdminContentLayout />}>
                      <Route path="/admin" element={<AdminIndex />} />
                      <Route path="/admin/breweries" element={<AdminBreweries />} />
                      <Route path="/admin/claims" element={<AdminClaims />} />
                      <Route path="/admin/users" element={<AdminUsers />} />
                      <Route path="/admin/brewery-import" element={<BreweryImport />} />
                    </Route>
                  </Route>
                </Routes>
                <Toaster />
              </SidebarProvider>
            </TooltipProvider>
          </RealtimeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
