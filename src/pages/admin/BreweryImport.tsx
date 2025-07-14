
import React from 'react';
import { NewBreweryImport } from '@/components/admin/brewery/import/NewBreweryImport';

const BreweryImport = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Brewery Import</h1>
        <p className="text-muted-foreground mt-2">
          Upload an Excel or CSV file to import breweries and their venues. 
          The system will automatically create breweries and geocode venue addresses.
        </p>
      </div>
      
      <NewBreweryImport />
    </div>
  );
};

export default BreweryImport;
