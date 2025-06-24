
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

const AdminRoute = () => {
  const { user, userType, loading } = useAuth();
  
  console.log('AdminRoute check:', { user: !!user, userType, loading });
  
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
  
  // Redirect to home page if not authenticated or not an admin
  if (!user || userType !== 'admin') {
    console.log('User not admin or not authenticated, redirecting to home');
    return <Navigate to="/" replace />;
  }
  
  console.log('Admin user authenticated, rendering admin content');
  // Render the protected content if user is admin
  return <Outlet />;
};

export default AdminRoute;
