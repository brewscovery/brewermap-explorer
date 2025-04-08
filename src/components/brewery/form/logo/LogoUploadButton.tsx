
import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Loader2 } from 'lucide-react';

interface LogoUploadButtonProps {
  uploading: boolean;
  breweryId?: string;
  hasLogo: boolean;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const LogoUploadButton = ({ 
  uploading, 
  breweryId, 
  hasLogo,
  onUpload 
}: LogoUploadButtonProps) => {
  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        type="button"
        disabled={uploading || !breweryId}
        onClick={() => document.getElementById('logo-upload')?.click()}
      >
        {uploading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4 mr-2" />
            {hasLogo ? 'Change Logo' : 'Upload Logo'}
          </>
        )}
      </Button>
      
      <input
        id="logo-upload"
        type="file"
        accept="image/*"
        onChange={onUpload}
        className="hidden"
        disabled={uploading || !breweryId}
      />
    </div>
  );
};
