import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { BreweryImportResult } from '@/types/breweryImport';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface BreweryImportResultsProps {
  results: BreweryImportResult[];
}

export const BreweryImportResults = ({ results }: BreweryImportResultsProps) => {
  if (results.length === 0) return null;

  const successCount = results.filter(r => r.success).length;
  const errorCount = results.length - successCount;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-4">
          Import Results
          <div className="flex gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {successCount} Success
            </Badge>
            {errorCount > 0 && (
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                {errorCount} Failed
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-64">
          <div className="space-y-2">
            {results.map((result, index) => (
              <div 
                key={index}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  result.success 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}
              >
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                )}
                
                <div className="flex-1 min-w-0">
                  <p className={`font-medium ${
                    result.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {result.name}
                  </p>
                  
                  {result.success ? (
                    <p className="text-sm text-green-600">
                      Successfully imported
                      {result.venue && ' with venue'}
                      {result.brewery && !result.venue && ' (brewery only)'}
                    </p>
                  ) : (
                    <p className="text-sm text-red-600">{result.error}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};