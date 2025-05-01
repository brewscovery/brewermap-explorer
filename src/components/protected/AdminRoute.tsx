
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, userType, loading } = useAuth();
  
  if (loading) {
    // Show loading state while auth state is being determined
    return <div>Loading...</div>;
  }
  
  // If user is not authenticated or not an admin, redirect to home
  if (!user || userType !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  // If user is authenticated and is an admin, render the children
  return <>{children}</>;
};

export default AdminRoute;
