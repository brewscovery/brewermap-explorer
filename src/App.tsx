
import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
  useLocation,
  Outlet,
} from 'react-router-dom';
import Index from './pages/Index';
import Auth from './pages/Auth';
import Admin from './pages/Admin';
import Dashboard from './pages/Dashboard';
import RegularDashboard from './pages/dashboard/RegularDashboard';
import FavoritesPage from './pages/dashboard/FavoritesPage';
import CheckInHistoryPage from './pages/dashboard/CheckInHistoryPage';
import TodoListsPage from './pages/dashboard/TodoListsPage';
import DiscoveriesPage from './pages/dashboard/DiscoveriesPage';
import SettingsPage from './pages/dashboard/SettingsPage';
import SubscriptionPage from './pages/dashboard/SubscriptionPage';
import VenuesPage from './pages/dashboard/VenuesPage';
import AdminLayout from './components/admin/AdminLayout';
import BreweriesAdmin from './pages/admin/breweries';
import UsersAdmin from './pages/admin/users';
import AppLayout from './components/layout/AppLayout';
import { useAuth } from './contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import EventsExplorer from '@/pages/dashboard/EventsExplorer';

function AppRouter() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const { user, userType } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect authenticated users based on their role
    if (user) {
      if (userType === 'admin' && !location.pathname.startsWith('/admin')) {
        navigate('/admin');
      } else if (userType === 'business' && !location.pathname.startsWith('/dashboard')) {
        navigate('/dashboard');
      }
    }
  }, [user, userType, navigate, location]);

  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Index />} />
      </Route>
      
      {/* Admin routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Admin />} />
        <Route path="breweries" element={<BreweriesAdmin />} />
        <Route path="users" element={<UsersAdmin />} />
      </Route>

      {/* Dashboard routes */}
      <Route path="/dashboard" element={<AppLayout />}>
        <Route index element={<Dashboard />}>
          <Route index element={<RegularDashboard />} />
          <Route path="favorites" element={<FavoritesPage />} />
          <Route path="check-ins" element={<CheckInHistoryPage />} />
          <Route path="todo-lists" element={<TodoListsPage />} />
          <Route path="events" element={<EventsExplorer />} />
          <Route path="discoveries" element={<DiscoveriesPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="subscription" element={<SubscriptionPage />} />
          <Route path="venues" element={<VenuesPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <>
      <AppRouter />
      <Toaster />
    </>
  );
}

export default App;
