
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Toaster } from '@/components/ui/sonner';
import './App.css';

// Pages
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import SettingsPage from '@/pages/dashboard/SettingsPage';
import VenuesPage from '@/pages/dashboard/VenuesPage';
import FavoritesPage from '@/pages/dashboard/FavoritesPage';
import CheckInHistoryPage from '@/pages/dashboard/CheckInHistoryPage';
import DiscoveriesPage from '@/pages/dashboard/DiscoveriesPage';
import SubscriptionPage from '@/pages/dashboard/SubscriptionPage';
import EventsPage from '@/pages/dashboard/EventsPage';
import TodoListsPage from '@/pages/dashboard/TodoListsPage';

// Admin pages
import AdminIndex from '@/pages/admin/Index';
import AdminBreweries from '@/pages/admin/Breweries';
import AdminClaims from '@/pages/admin/Claims';
import AdminUsers from '@/pages/admin/Users';

// Layouts
import AppLayout from '@/components/layout/AppLayout';
import AdminLayout from '@/components/admin/AdminLayout';

// Protected routes
import AdminRoute from '@/components/protected/AdminRoute';

function App() {
  const { setUser, setUserType } = useAuth();
  
  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);

      if (session) {
        setUser(session.user);
        
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('user_type')
            .eq('id', session.user.id)
            .single();
          
          if (error) throw error;
          setUserType(profile.user_type);
          
        } catch (err) {
          console.error('Error fetching user profile:', err);
          setUserType('regular'); // Default to regular user if there's an error
        }
      } else {
        setUser(null);
        setUserType(null);
      }
    });

    // Clean up subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setUserType]);
  
  return (
    <BrowserRouter>
      <SidebarProvider>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Index />} />
            <Route path="auth" element={<Auth />} />
            
            {/* Dashboard Routes */}
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="dashboard/settings" element={<SettingsPage />} />
            <Route path="dashboard/venues" element={<VenuesPage />} />
            <Route path="dashboard/favorites" element={<FavoritesPage />} />
            <Route path="dashboard/history" element={<CheckInHistoryPage />} />
            <Route path="dashboard/discoveries" element={<DiscoveriesPage />} />
            <Route path="dashboard/subscription" element={<SubscriptionPage />} />
            <Route path="dashboard/events" element={<EventsPage />} />
            <Route path="dashboard/todo-lists" element={<TodoListsPage />} />
            
            {/* Admin Routes */}
            <Route path="admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index element={<AdminIndex />} />
              <Route path="breweries" element={<AdminBreweries />} />
              <Route path="claims" element={<AdminClaims />} />
              <Route path="users" element={<AdminUsers />} />
            </Route>
          </Route>
        </Routes>
        
        <Toaster />
      </SidebarProvider>
    </BrowserRouter>
  );
}

export default App;
