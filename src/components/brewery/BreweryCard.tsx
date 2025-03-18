
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Edit, 
  Globe,
  Facebook,
  Instagram,
  Star,
  MapPin
} from 'lucide-react';
import type { Brewery } from '@/types/brewery';
import { cn } from '@/lib/utils';
import { useBreweryStats } from '@/hooks/useBreweryStats';

interface BreweryCardProps {
  brewery: Brewery;
  isSelected: boolean;
  onClick: () => void;
  onEdit?: () => void;
}

const BreweryCard = ({ 
  brewery, 
  isSelected, 
  onClick, 
  onEdit 
}: BreweryCardProps) => {
  const { stats, isLoading } = useBreweryStats(brewery.id);
  
  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all hover:shadow-md cursor-pointer",
        isSelected && "ring-2 ring-primary border-primary"
      )}
      onClick={onClick}
    >
      <CardHeader className={cn(
        "pb-2 border-b",
        isSelected ? "bg-primary/10" : "bg-muted/20"
      )}>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl line-clamp-1">{brewery.name}</CardTitle>
            {brewery.brewery_type && (
              <p className="text-sm text-muted-foreground mt-1 capitalize">
                {brewery.brewery_type} brewery
              </p>
            )}
          </div>
          {onEdit && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          {brewery.about && (
            <p className="text-sm line-clamp-3 text-muted-foreground">
              {brewery.about}
            </p>
          )}
          
          {brewery.website_url && (
            <div className="flex items-center gap-3">
              <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <a 
                href={brewery.website_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-500 hover:text-blue-700 hover:underline truncate max-w-[200px]"
                onClick={(e) => e.stopPropagation()}
              >
                {brewery.website_url.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}
          
          <div className="flex flex-wrap gap-3 mt-4">
            {brewery.facebook_url && (
              <a 
                href={brewery.facebook_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <Facebook className="h-4 w-4" />
                <span className="sr-only">Facebook</span>
              </a>
            )}
            
            {brewery.instagram_url && (
              <a 
                href={brewery.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-sm text-pink-600 hover:text-pink-800 flex items-center gap-1"
              >
                <Instagram className="h-4 w-4" />
                <span className="sr-only">Instagram</span>
              </a>
            )}
          </div>
          
          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between text-sm">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{isLoading ? '...' : stats.venueCount}</span>
                <span className="text-muted-foreground">venues</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-amber-500" />
                <span>{isLoading ? '...' : (stats.averageRating ? stats.averageRating.toFixed(1) : 'No')}</span>
                <span className="text-muted-foreground">avg rating</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BreweryCard;
