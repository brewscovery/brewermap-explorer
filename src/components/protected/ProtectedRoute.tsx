
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  
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
  
  // Redirect to auth page if not authenticated
  if (!user) {
    console.log('User not authenticated, redirecting to auth page');
    return <Navigate to="/auth" replace />;
  }
  
  // Render the protected content if authenticated
  return <Outlet />;
};

export default ProtectedRoute;
