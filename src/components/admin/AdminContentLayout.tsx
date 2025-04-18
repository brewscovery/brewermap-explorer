
import React from 'react';
import { Outlet } from 'react-router-dom';

const AdminContentLayout = () => {
  return (
    <div className="flex-1 flex flex-col">
      <header className="p-4 border-b">
        <h1 className="text-xl font-bold">Admin Control Panel</h1>
      </header>
      <main className="p-6 flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminContentLayout;
