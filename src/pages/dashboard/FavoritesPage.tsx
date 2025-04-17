
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

const FavoritesPage = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>My Favorites</CardTitle>
          <CardDescription>
            Breweries and venues you've marked as favorites
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              You haven't added any favorites yet.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FavoritesPage;
