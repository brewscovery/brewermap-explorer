
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

const AdminRoute = () => {
  const { user, userType, loading } = useAuth();
  
  // Show loading state while authentication is being checked
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="space-y-4 w-1/2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-8 w-3/4 mx-auto" />
        </div>
      </div>
    );
  }
  
  console.log('AdminRoute check:', { user, userType, loading });
  
  // Redirect to login if not authenticated or not an admin
  if (!user || userType !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  // Render the protected content if user is admin
  return <Outlet />;
};

export default AdminRoute;
