
import React, { createContext, useContext, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import InvalidationManager from '@/services/InvalidationManager';

const InvalidationContext = createContext<InvalidationManager | null>(null);

interface InvalidationProviderProps {
  children: ReactNode;
}

export const InvalidationProvider: React.FC<InvalidationProviderProps> = ({ children }) => {
  const queryClient = useQueryClient();
  const invalidationManager = new InvalidationManager(queryClient);

  return (
    <InvalidationContext.Provider value={invalidationManager}>
      {children}
    </InvalidationContext.Provider>
  );
};

export const useInvalidationManager = (): InvalidationManager => {
  const context = useContext(InvalidationContext);
  if (!context) {
    throw new Error('useInvalidationManager must be used within an InvalidationProvider');
  }
  return context;
};
