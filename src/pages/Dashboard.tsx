
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtimeUser, useRealtimeBusinessUser } from '@/hooks/useRealtimeUser';
import RegularDashboard from './dashboard/RegularDashboard';
import EventsPage from './dashboard/EventsPage';
import VenuesPage from './dashboard/VenuesPage';
import CheckInHistoryPage from './dashboard/CheckInHistoryPage';
import FavoritesPage from './dashboard/FavoritesPage';
import TodoListsPage from './dashboard/TodoListsPage';
import DiscoveriesPage from './dashboard/DiscoveriesPage';
import SettingsPage from './dashboard/SettingsPage';
import SubscriptionPage from './dashboard/SubscriptionPage';
import EventsExplorer from './dashboard/EventsExplorer';
import BreweryInfo from '@/components/brewery/BreweryInfo';
import AppLayout from '@/components/layout/AppLayout';

const Dashboard = () => {
  const { userType } = useAuth();
  
  // Set up real-time subscriptions for the current user
  useRealtimeUser();
  useRealtimeBusinessUser();

  return (
    <AppLayout>
      <Routes>
        <Route 
          path="/" 
          element={
            userType === 'business' ? (
              <div className="max-w-6xl mx-auto space-y-6">
                <BreweryInfo />
              </div>
            ) : (
              <RegularDashboard />
            )
          } 
        />
        <Route path="/events" element={userType === 'business' ? <EventsPage /> : <EventsExplorer />} />
        <Route path="/venues" element={<VenuesPage />} />
        <Route path="/check-ins" element={<CheckInHistoryPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/todo-lists" element={<TodoListsPage />} />
        <Route path="/discoveries" element={<DiscoveriesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/subscription" element={<SubscriptionPage />} />
      </Routes>
    </AppLayout>
  );
};

export default Dashboard;
