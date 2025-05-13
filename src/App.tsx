
import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
  useLocation,
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
import { Toast } from '@/components/ui/toast';
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
      <Route path="/" element={<AppLayout><Index /></AppLayout>} />
      
      {/* Admin routes */}
      <Route path="/admin" element={<AdminLayout><Admin /></AdminLayout>} />
      <Route path="/admin/breweries" element={<AdminLayout><BreweriesAdmin /></AdminLayout>} />
      <Route path="/admin/users" element={<AdminLayout><UsersAdmin /></AdminLayout>} />

      {/* Dashboard routes */}
      <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>}>
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
    </Routes>
  );
}

function App() {
  return (
    <>
      <AppRouter />
      <Toast />
    </>
  );
}

export default App;
