
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useConnectionMonitor } from '@/hooks/useConnectionMonitor';
import { Activity, Database, Clock, TrendingUp } from 'lucide-react';
import { MAX_DB_CONNECTIONS } from '@/constants/db';

const ConnectionMonitor: React.FC = () => {
  const { stats, alerts } = useConnectionMonitor();

  const connectionUsagePercent = (stats.activeConnections / MAX_DB_CONNECTIONS) * 100; // Assuming 500 max connections for Supabase PRO
  const queueStatus = stats.queuedQueries > 0 ? 'warning' : 'success';

  return (
    <div className="space-y-4">
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, index) => (
            <Alert key={index} variant="destructive">
              <AlertDescription>{alert}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeConnections}/MAX_DB_CONNECTIONS</div>
            <Progress value={connectionUsagePercent} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {connectionUsagePercent.toFixed(1)}% usage
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Queued Queries</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.queuedQueries}</div>
            <Badge variant={queueStatus === 'warning' ? 'destructive' : 'default'} className="mt-2">
              {queueStatus === 'warning' ? 'Queuing' : 'Normal'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageResponseTime.toFixed(0)}ms</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.averageResponseTime < 1000 ? 'Excellent' : 
               stats.averageResponseTime < 3000 ? 'Good' : 'Needs attention'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalQueries} total queries
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Query Statistics</CardTitle>
          <CardDescription>Detailed breakdown of database queries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-medium">Total Queries</p>
              <p className="text-2xl font-bold">{stats.totalQueries}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Successful</p>
              <p className="text-2xl font-bold text-green-600">{stats.successfulQueries}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Failed</p>
              <p className="text-2xl font-bold text-red-600">{stats.failedQueries}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Peak Connections</p>
              <p className="text-2xl font-bold">{stats.peakConnections}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConnectionMonitor;
