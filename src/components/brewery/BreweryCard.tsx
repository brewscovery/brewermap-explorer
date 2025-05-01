
import React, { useState, useEffect } from 'react';
import { Edit } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Brewery } from '@/types/brewery';

interface BreweryCardProps {
  brewery: Brewery;
  isSelected: boolean;
  onClick: () => void;
  onEdit: () => void;
}

const BreweryCard = ({ brewery, isSelected, onClick, onEdit }: BreweryCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  
  // Reset error state and update logo URL when brewery changes
  useEffect(() => {
    setImageError(false);
    
    if (brewery.logo_url) {
      console.log('BreweryCard loading logo from:', brewery.logo_url);
      
      // Extract the bucket and brewery ID from the URL to ensure we get the right file
      const urlParts = brewery.logo_url.split('/');
      const bucketPart = urlParts.findIndex(part => part === 'brewery_logos');
      
      if (bucketPart !== -1 && bucketPart < urlParts.length - 1) {
        // This should set logoUrl to the original URL, but we're explicitly doing it
        // to ensure we're using the most up-to-date URL
        setLogoUrl(brewery.logo_url);
      } else {
        console.warn('Invalid logo URL format:', brewery.logo_url);
        setLogoUrl(null);
      }
    } else {
      setLogoUrl(null);
    }
  }, [brewery.logo_url]);
  
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit();
  };

  const handleImageError = () => {
    console.error('Logo image failed to load:', logoUrl);
    setImageError(true);
  };

  // Get the initials for the fallback
  const getInitials = () => {
    return brewery.name.substring(0, 2).toUpperCase();
  };

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${isSelected ? 'ring-2 ring-primary' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border">
            {logoUrl && !imageError ? (
              <AvatarImage 
                src={logoUrl} 
                alt={brewery.name} 
                onError={handleImageError}
              />
            ) : null}
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <CardTitle className="text-lg">{brewery.name}</CardTitle>
            {/* Removed brewery_type badge as this field no longer exists */}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        {brewery.about && (
          <CardDescription className="line-clamp-2">
            {brewery.about}
          </CardDescription>
        )}
      </CardContent>
      
      <CardFooter className="pt-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="ml-auto"
          onClick={handleEditClick}
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BreweryCard;
