
import { Routes, Route } from 'react-router-dom';
import { useAuthState } from '@/hooks/useAuthState';
import { useRealtimeUser } from '@/hooks/useRealtimeUser';
import { useRealtimeBusinessUser } from '@/hooks/useRealtimeBusinessUser';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import AdminIndex from '@/pages/admin/Index';
import AdminBreweries from '@/pages/admin/Breweries';
import AdminUsers from '@/pages/admin/Users';
import AdminClaims from '@/pages/admin/Claims';
import AdminBreweryImport from '@/pages/admin/BreweryImport';
import CheckInHistoryPage from '@/pages/dashboard/CheckInHistoryPage';
import FavoritesPage from '@/pages/dashboard/FavoritesPage';
import DiscoveriesPage from '@/pages/dashboard/DiscoveriesPage';
import EventsPage from '@/pages/dashboard/EventsPage';
import EventsExplorer from '@/pages/dashboard/EventsExplorer';
import TodoListsPage from '@/pages/dashboard/TodoListsPage';
import SettingsPage from '@/pages/dashboard/SettingsPage';
import SubscriptionPage from '@/pages/dashboard/SubscriptionPage';
import VenuesPage from '@/pages/dashboard/VenuesPage';
import RegularDashboard from '@/pages/dashboard/RegularDashboard';
import VenueQrRedirect from '@/components/qr/VenueQrRedirect';
import AppLayout from '@/components/layout/AppLayout';
import ProtectedRoute from '@/components/protected/ProtectedRoute';
import AdminRoute from '@/components/protected/AdminRoute';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import './App.css';

function App() {
  useAuthState();
  useRealtimeUser();
  useRealtimeBusinessUser();

  return (
    <>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/qr/:venueId" element={<VenueQrRedirect />} />
        <Route element={<AppLayout />}>
          <Route path="/" element={<Index />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/regular" element={<RegularDashboard />} />
            <Route path="/dashboard/checkins" element={<CheckInHistoryPage />} />
            <Route path="/dashboard/favorites" element={<FavoritesPage />} />
            <Route path="/dashboard/discoveries" element={<DiscoveriesPage />} />
            <Route path="/dashboard/events" element={<EventsPage />} />
            <Route path="/dashboard/events-explorer" element={<EventsExplorer />} />
            <Route path="/dashboard/todo-lists" element={<TodoListsPage />} />
            <Route path="/dashboard/settings" element={<SettingsPage />} />
            <Route path="/dashboard/subscription" element={<SubscriptionPage />} />
            <Route path="/dashboard/venues" element={<VenuesPage />} />
          </Route>
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminIndex />} />
            <Route path="/admin/breweries" element={<AdminBreweries />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/claims" element={<AdminClaims />} />
            <Route path="/admin/import" element={<AdminBreweryImport />} />
          </Route>
        </Route>
      </Routes>
      <PWAInstallPrompt />
    </>
  );
}

export default App;
