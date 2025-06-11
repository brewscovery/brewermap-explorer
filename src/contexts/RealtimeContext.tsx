import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { RealtimeManager, type RealtimeEventType } from '@/services/RealtimeManager';
import { useAuth } from '@/contexts/AuthContext';

interface RealtimeContextType {
  subscribe: (eventType: RealtimeEventType, callback: (payload: any) => void, filter?: Record<string, any>) => string;
  unsubscribe: (subscriptionId: string) => void;
  getStats: () => any;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

interface RealtimeProviderProps {
  children: ReactNode;
}

export const RealtimeProvider = ({ children }: RealtimeProviderProps) => {
  const { user } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    setIsInitialized(true);
    
    return () => {
      RealtimeManager.cleanup();
    };
  }, []);

  const subscribe = (eventType: RealtimeEventType, callback: (payload: any) => void, filter?: Record<string, any>) => {
    return RealtimeManager.subscribe(eventType, callback, filter);
  };

  const unsubscribe = (subscriptionId: string) => {
    RealtimeManager.unsubscribe(subscriptionId);
  };

  const getStats = () => {
    return RealtimeManager.getActiveSubscriptions();
  };

  const value = {
    subscribe,
    unsubscribe,
    getStats,
  };

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (context === undefined) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
};