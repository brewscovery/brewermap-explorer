
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const AdminRoute = () => {
  const { user, userType, loading } = useAuth();
  
  // Show loading state while authentication is being checked
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  // Redirect to login if not authenticated or not an admin
  if (!user || userType !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  // Render the protected content if user is admin
  return <Outlet />;
};

export default AdminRoute;
