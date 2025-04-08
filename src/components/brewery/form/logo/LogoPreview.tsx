
import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { X } from 'lucide-react';

interface LogoPreviewProps {
  previewUrl: string | null;
  breweryName: string;
  onRemove: () => void;
}

export const LogoPreview = ({ previewUrl, breweryName, onRemove }: LogoPreviewProps) => {
  if (!previewUrl) {
    return (
      <div className="border rounded-md p-4 w-full flex flex-col items-center gap-2">
        <div className="bg-muted rounded-full p-3">
          <Upload className="h-5 w-5" />
        </div>
        <p className="text-sm text-muted-foreground text-center">
          Upload a logo for your brewery
        </p>
      </div>
    );
  }
  
  return (
    <div className="relative">
      <Avatar className="w-24 h-24 border">
        <AvatarImage src={previewUrl} alt="Brewery logo" />
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
