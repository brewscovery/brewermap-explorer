import React, { createContext, useContext, useState, ReactNode } from 'react';

interface VenueSidebarContextType {
  isVenueSidebarOpen: boolean;
  setIsVenueSidebarOpen: (isOpen: boolean) => void;
}

const VenueSidebarContext = createContext<VenueSidebarContextType | undefined>(undefined);

export const useVenueSidebar = () => {
  const context = useContext(VenueSidebarContext);
  if (context === undefined) {
    throw new Error('useVenueSidebar must be used within a VenueSidebarProvider');
  }
  return context;
};

interface VenueSidebarProviderProps {
  children: ReactNode;
}

export const VenueSidebarProvider: React.FC<VenueSidebarProviderProps> = ({ children }) => {
  const [isVenueSidebarOpen, setIsVenueSidebarOpen] = useState(false);

  return (
    <VenueSidebarContext.Provider value={{ isVenueSidebarOpen, setIsVenueSidebarOpen }}>
      {children}
    </VenueSidebarContext.Provider>
  );
};