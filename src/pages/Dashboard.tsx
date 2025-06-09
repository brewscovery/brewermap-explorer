
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtimeUser, useRealtimeBusinessUser } from '@/hooks/useRealtimeUser';
import { useBreweryFetching } from '@/hooks/useBreweryFetching';
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
import BreweryManager from '@/components/dashboard/BreweryManager';
import AppLayout from '@/components/layout/AppLayout';

const Dashboard = () => {
  const { userType, user } = useAuth();
  
  // Set up real-time subscriptions for the current user
  useRealtimeUser();
  useRealtimeBusinessUser();

  // Fetch brewery data for business users
  const {
    breweries,
    selectedBrewery,
    isLoading,
    setSelectedBrewery,
    fetchBreweries
  } = useBreweryFetching(user?.id);

  return (
    <AppLayout>
      <Routes>
        <Route 
          path="/" 
          element={
            userType === 'business' ? (
              <div className="max-w-6xl mx-auto space-y-6">
                <BreweryManager 
                  breweries={breweries}
                  selectedBrewery={selectedBrewery}
                  isLoading={isLoading}
                  onBrewerySelect={setSelectedBrewery}
                  onNewBreweryAdded={fetchBreweries}
                />
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
