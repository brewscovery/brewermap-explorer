
import React from 'react';
import { Outlet } from 'react-router-dom';
import { FloatingSidebarToggle } from '@/components/ui/FloatingSidebarToggle';

const AdminContentLayout = () => {
  return (
    <div className="flex-1 flex flex-col pt-4">
      <FloatingSidebarToggle position="top-left" />
      <main className="p-6 flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminContentLayout;
