import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { BreweryImportData, FileParseResult, BreweryImportResult } from '@/types/breweryImport';
import { parseFile } from '@/utils/breweryFileParser';
import { bulkImportBreweries } from '@/utils/breweryImporter';
import { FileUpload } from './FileUpload';
import { BreweryImportTable } from './BreweryImportTable';
import { BreweryImportResults } from './BreweryImportResults';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const NewBreweryImport = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [parseResult, setParseResult] = useState<FileParseResult | null>(null);
  const [breweries, setBreweries] = useState<BreweryImportData[]>([]);
  const [importResults, setImportResults] = useState<BreweryImportResult[]>([]);
  const [currentFile, setCurrentFile] = useState<File | null>(null);

  const handleFileSelect = async (file: File) => {
    setIsUploading(true);
    setParseResult(null);
    setBreweries([]);
    setImportResults([]);
    setCurrentFile(file);

    try {
      const result = await parseFile(file);
      setParseResult(result);
      setBreweries(result.data);
    } catch (error) {
      console.error('Error processing file:', error);
      setParseResult({
        data: [],
        errors: [`Failed to process file: ${error instanceof Error ? error.message : 'Unknown error'}`]
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleImport = async () => {
    const selectedBreweries = breweries.filter(b => b.selected);
    if (selectedBreweries.length === 0) return;

    setIsImporting(true);
    try {
      const results = await bulkImportBreweries(selectedBreweries);
      setImportResults(results);
    } catch (error) {
      console.error('Import error:', error);
    } finally {
      setIsImporting(false);
    }
  };

  const handleBreweriesUpdate = (updatedBreweries: BreweryImportData[]) => {
    setBreweries(updatedBreweries);
  };

  const handleStartOver = () => {
    setParseResult(null);
    setBreweries([]);
    setImportResults([]);
    setCurrentFile(null);
  };

  return (
    <div className="space-y-6">
      {/* File Upload */}
      <FileUpload onFileSelect={handleFileSelect} isLoading={isUploading} />

      {/* Parse Errors */}
      {parseResult && parseResult.errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">File parsing errors:</p>
              <ul className="list-disc list-inside space-y-1">
                {parseResult.errors.map((error, index) => (
                  <li key={index} className="text-sm">{error}</li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Current File Info */}
      {currentFile && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <span>File: {currentFile.name}</span>
              <Button variant="outline" size="sm" onClick={handleStartOver}>
                Upload Different File
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">
              Size: {(currentFile.size / 1024).toFixed(1)} KB • 
              Last modified: {currentFile.lastModified ? new Date(currentFile.lastModified).toLocaleDateString() : 'Unknown'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Import Table */}
      {breweries.length > 0 && (
        <BreweryImportTable
          breweries={breweries}
          onBreweriesUpdate={handleBreweriesUpdate}
          onImport={handleImport}
          isImporting={isImporting}
        />
      )}

      {/* Import Results */}
      {importResults.length > 0 && (
        <BreweryImportResults results={importResults} />
      )}
    </div>
  );
};