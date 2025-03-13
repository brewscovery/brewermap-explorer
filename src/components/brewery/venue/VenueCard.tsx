
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Edit, 
  Trash2, 
  Clock, 
  Building, 
  Phone, 
  Globe,
  Flag,
  Star
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Venue } from '@/types/venue';
import VenueHoursDisplay from '../VenueHoursDisplay';

interface RatingData {
  venue_id: string;
  average_rating: number;
  total_checkins: number;
}

interface VenueCardProps {
  venue: Venue;
  ratingData?: RatingData;
  onEdit: (venue: Venue) => void;
  onEditHours: (venue: Venue) => void;
  onDelete: (venue: Venue) => void;
}

const VenueCard = ({ venue, ratingData, onEdit, onEditHours, onDelete }: VenueCardProps) => {
  console.log(`VenueCard for ${venue.name} (ID: ${venue.id}) with rating data:`, ratingData);
  
  const { average_rating = 0, total_checkins = 0 } = ratingData || {};
  
  return (
    <Card key={venue.id} className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-2 border-b bg-muted/20">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl line-clamp-1">{venue.name}</CardTitle>
            {total_checkins > 0 && (
              <div className="flex items-center mt-1 text-sm text-muted-foreground">
                <Star className="h-4 w-4 text-amber-500 mr-1 fill-current" />
                <span>{average_rating.toFixed(1)}</span>
                <span className="ml-1">({total_checkins} {total_checkins === 1 ? 'check-in' : 'check-ins'})</span>
              </div>
            )}
            {total_checkins === 0 && (
              <div className="text-sm text-muted-foreground mt-1">No check-ins yet</div>
            )}
          </div>
          {venue.latitude && venue.longitude ? (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Mapped
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
              Unmapped
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Building className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="text-sm text-muted-foreground">
              {venue.street && <p>{venue.street}</p>}
              <p>{venue.city}, {venue.state} {venue.postal_code || ''}</p>
              {venue.country && venue.country !== 'United States' && (
                <div className="flex items-center gap-1 mt-1">
                  <Flag className="h-3 w-3 text-muted-foreground" />
                  <span>{venue.country}</span>
                </div>
              )}
            </div>
          </div>
          
          {venue.phone && (
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm">{venue.phone}</span>
            </div>
          )}
          
          {venue.website_url && (
            <div className="flex items-center gap-3">
              <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <a 
                href={venue.website_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-500 hover:text-blue-700 hover:underline truncate max-w-[200px]"
              >
                {venue.website_url.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}

          <VenueHoursDisplay venueId={venue.id} />
          
          <div className="flex gap-2 mt-4 pt-4 border-t">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onEdit(venue)}
              className="flex-1"
            >
              <Edit className="mr-1" size={14} />
              Edit
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onEditHours(venue)}
              className="flex-1"
            >
              <Clock className="mr-1" size={14} />
              Hours
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => onDelete(venue)}
            >
              <Trash2 className="mr-1" size={14} />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VenueCard;
