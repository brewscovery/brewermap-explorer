
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { bulkCreateBreweriesWithVenues } from '@/utils/bulkBreweryImport';

const testBreweries = [
  {
    name: 'Alarmist Brewing',
    address: '4055 W Peterson Ave., Suite Rear, Chicago, Illinois 60646-6072',
    website: 'www.alarmistbrewing.com'
  },
  {
    name: 'Aleman Brewing',
    address: '3304 N Knox Ave., Chicago, Illinois 60641-4434',
    website: 'www.alemanchicago.com'
  },
  {
    name: 'All Rise Brewing Co',
    address: '235 N Ashland Ave., Chicago, Illinois 60607-1401',
    website: 'www.allrisebrewing.com'
  }
];

export const BulkBreweryImport = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const handleImport = async () => {
    setIsImporting(true);
    setResults([]);
    
    try {
      const importResults = await bulkCreateBreweriesWithVenues(testBreweries);
      setResults(importResults);
    } catch (error) {
      console.error('Import failed:', error);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Bulk Brewery Import</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Breweries to Import:</h3>
          <ul className="text-sm space-y-1">
            {testBreweries.map((brewery, index) => (
              <li key={index} className="flex justify-between">
                <span>{brewery.name}</span>
                <span className="text-muted-foreground">{brewery.address.split(',').slice(-2).join(',')}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <Button 
          onClick={handleImport} 
          disabled={isImporting}
          className="w-full"
        >
          {isImporting ? 'Importing...' : 'Import Breweries'}
        </Button>
        
        {results.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Import Results:</h3>
            <div className="space-y-2">
              {results.map((result, index) => (
                <div 
                  key={index} 
                  className={`p-2 rounded text-sm ${
                    result.success 
                      ? 'bg-green-50 text-green-800 border border-green-200' 
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {result.success 
                    ? `✓ ${result.brewery.name} created successfully`
                    : `✗ ${result.name}: ${result.error}`
                  }
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
