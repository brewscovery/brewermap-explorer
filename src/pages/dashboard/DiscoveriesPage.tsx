
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

const DiscoveriesPage = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Brewery Discoveries</CardTitle>
          <CardDescription>
            Discover new breweries and venues in your area
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Coming soon! This feature is currently under development.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DiscoveriesPage;
