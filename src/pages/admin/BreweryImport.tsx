
import React from 'react';
import { AdminBulkBreweryImport } from '@/components/admin/brewery/AdminBulkBreweryImport';

const BreweryImport = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Brewery Import</h1>
        <p className="text-muted-foreground mt-2">
          Import breweries and their corresponding venues into the database
        </p>
      </div>
      
      <AdminBulkBreweryImport />
    </div>
  );
};

export default BreweryImport;
