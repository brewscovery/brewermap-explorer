
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

const CheckInHistoryPage = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Check-in History</CardTitle>
          <CardDescription>
            Your past check-ins at breweries and venues
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              You haven't checked in anywhere yet.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckInHistoryPage;
