import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
}

export const FileUpload = ({ onFileSelect, isLoading }: FileUploadProps) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv']
    },
    multiple: false,
    disabled: isLoading
  });

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-primary hover:bg-accent/50'
            }
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-4">
            {isDragActive ? (
              <Upload className="h-12 w-12 text-primary" />
            ) : (
              <FileSpreadsheet className="h-12 w-12 text-muted-foreground" />
            )}
            <div className="space-y-2">
              <p className="text-lg font-medium">
                {isDragActive
                  ? 'Drop the file here...'
                  : 'Upload brewery data file'
                }
              </p>
              <p className="text-sm text-muted-foreground">
                Drag & drop an Excel (.xlsx, .xls) or CSV file here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                Expected columns: name, address, city, state, country, postal code, phone, web page, is independent
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};