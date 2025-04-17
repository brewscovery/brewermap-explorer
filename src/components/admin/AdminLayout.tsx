
import React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
  return (
    <SidebarProvider>
      <div className="flex w-full min-h-screen">
        <AdminSidebar />
        <SidebarInset className="h-screen overflow-auto">
          <header className="p-4 border-b flex items-center">
            <SidebarTrigger className="mr-2" />
            <h1 className="text-xl font-bold">Admin Control Panel</h1>
          </header>
          <main className="p-6">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
