
import React from 'react';
import { Edit } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Brewery } from '@/types/brewery';

interface BreweryCardProps {
  brewery: Brewery;
  isSelected: boolean;
  onClick: () => void;
  onEdit: () => void;
}

const BreweryCard = ({ brewery, isSelected, onClick, onEdit }: BreweryCardProps) => {
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit();
  };

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${isSelected ? 'ring-2 ring-primary' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border">
            <AvatarImage src={brewery.logo_url || ''} alt={brewery.name} />
            <AvatarFallback>{brewery.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <CardTitle className="text-lg">{brewery.name}</CardTitle>
            {brewery.brewery_type && (
              <Badge variant="outline" className="font-normal">
                {brewery.brewery_type}
              </Badge>
            )}
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
