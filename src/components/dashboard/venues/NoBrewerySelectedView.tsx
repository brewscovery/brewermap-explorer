
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export const NoBrewerySelectedView = () => {
  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Venues</h2>
      
      <Alert>
        <AlertTitle>No brewery selected</AlertTitle>
        <AlertDescription>
          Please select a brewery from the sidebar to manage its venues.
        </AlertDescription>
      </Alert>
    </div>
  );
};
