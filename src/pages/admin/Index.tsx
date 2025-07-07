
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardCheck, Beer, Users } from 'lucide-react';
import { useAdminStats } from '@/hooks/useAdminData';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import ConnectionMonitor from '@/components/debug/ConnectionMonitor';
import { AdminQrCodeGenerator } from '@/components/admin/AdminQrCodeGenerator';

const AdminDashboard = () => {
  const { data: stats, isLoading, error } = useAdminStats();
  
  return (
    <div className="space-y-6 pt-4">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      
      {error && (
        <div className="p-4 border rounded-md bg-red-50 text-red-800">
          Error loading dashboard stats: {error.message}
        </div>
      )}
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link to="/admin/claims">
          <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Claims</CardTitle>
              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.pendingClaims || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Brewery verification requests
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/admin/breweries">
          <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Breweries</CardTitle>
              <Beer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.totalBreweries || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Active breweries in the system
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/admin/users">
          <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Registered users
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </Link>
      </div>
      
      <div className="space-y-6">
        <AdminQrCodeGenerator />
        
        <Card>
          <CardHeader>
            <CardTitle>Database Connection Monitor</CardTitle>
          </CardHeader>
          <CardContent>
            <ConnectionMonitor />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-5 w-5/6" />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No recent activity to display.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
