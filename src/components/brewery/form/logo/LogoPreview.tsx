
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { X, Upload } from 'lucide-react';

interface LogoPreviewProps {
  previewUrl: string | null;
  breweryName: string;
  onRemove: () => void;
}

export const LogoPreview = ({ previewUrl, breweryName, onRemove }: LogoPreviewProps) => {
  const [imageError, setImageError] = useState(false);

  // Reset image error state when preview URL changes
  useEffect(() => {
    setImageError(false);
    if (previewUrl) {
      console.log('LogoPreview received URL:', previewUrl);
    }
  }, [previewUrl]);

  const handleImageError = () => {
    console.error('Failed to load logo image:', previewUrl);
    setImageError(true);
  };

  if (!previewUrl || imageError) {
    return (
      <div className="border rounded-md p-4 w-full flex flex-col items-center gap-2">
        <div className="bg-muted rounded-full p-3">
          <Upload className="h-5 w-5" />
        </div>
        <p className="text-sm text-muted-foreground text-center">
          {imageError ? 'Error loading logo' : 'Upload a logo for your brewery'}
        </p>
      </div>
    );
  }
  
  return (
    <div className="relative">
      <Avatar className="w-24 h-24 border">
        <AvatarImage 
          src={previewUrl} 
          alt="Brewery logo" 
          onError={handleImageError}
        />
        <AvatarFallback>{breweryName.substring(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <Button
        variant="destructive"
        size="icon"
        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
        onClick={onRemove}
        type="button"
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
};
