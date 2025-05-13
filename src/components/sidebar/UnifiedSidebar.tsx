import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { useAuth } from '@/contexts/AuthContext';

const UnifiedSidebar = () => {
  const { userType } = useAuth();
  const location = useLocation();
  
  // Use appropriate sidebar based on user type and route
  if (userType === 'admin' || location.pathname.startsWith('/admin')) {
    return <AdminSidebar />;
  }
  
  // For business users or dashboard routes, other sidebars will be implemented here
  if (userType === 'business' || location.pathname.startsWith('/dashboard')) {
    // Using AdminSidebar for now, but this should be replaced with appropriate sidebar
    return <AdminSidebar />;
  }
  
  // Default empty sidebar for other routes
  return null;
};

export default UnifiedSidebar;
