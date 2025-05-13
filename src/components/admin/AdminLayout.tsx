
import React, { ReactNode } from 'react';
import UnifiedSidebar from '@/components/sidebar/UnifiedSidebar';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <div className="flex min-h-screen">
      <UnifiedSidebar />
      <div className="flex-1 p-6">
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
