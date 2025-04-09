
import { useState } from 'react';
import { AlertDialog, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PencilIcon, Trash2Icon, Clock } from 'lucide-react';
import { EmptyPlaceholder } from '@/components/ui/empty-placeholder';
import type { Venue } from '@/types/venue';
import EditVenueDialog from '@/components/brewery/EditVenueDialog';
import VenueHoursDialog from '@/components/brewery/VenueHoursDialog';

interface VenueListProps {
  venues: Venue[];
  isLoading: boolean;
  onDeleteVenue: (venue: Venue) => void;
}

export const VenueList = ({ 
  venues, 
  isLoading, 
  onDeleteVenue 
}: VenueListProps) => {
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [venueForHours, setVenueForHours] = useState<Venue | null>(null);
  
  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-8 w-full bg-gray-100 animate-pulse rounded"></div>
        <div className="h-20 w-full bg-gray-100 animate-pulse rounded"></div>
      </div>
    );
  }
  
  if (!venues || venues.length === 0) {
    return (
      <EmptyPlaceholder>
        <EmptyPlaceholder.Icon name="venue" />
        <EmptyPlaceholder.Title>No venues</EmptyPlaceholder.Title>
        <EmptyPlaceholder.Description>
          This brewery has no venues yet. Add a new venue to get started.
        </EmptyPlaceholder.Description>
      </EmptyPlaceholder>
    );
  }
  
  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Location</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {venues.map((venue) => (
            <TableRow key={venue.id}>
              <TableCell>{venue.name}</TableCell>
              <TableCell>
                {venue.city}, {venue.state}
                {venue.postal_code && ` ${venue.postal_code}`}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setEditingVenue(venue)}
                  >
                    <PencilIcon className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setVenueForHours(venue)}
                  >
                    <Clock className="h-4 w-4" />
                    <span className="sr-only">Hours</span>
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-destructive"
                      >
                        <Trash2Icon className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </AlertDialogTrigger>
                    
                    {/* The confirmation dialog is shown via onDeleteVenue in the parent component */}
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {/* Edit Venue Dialog */}
      <EditVenueDialog
        open={editingVenue !== null}
        onOpenChange={(open) => {
          if (!open) setEditingVenue(null);
        }}
        venue={editingVenue}
        onVenueUpdated={async () => {
          // This is handled by the parent component through realtime updates
          setEditingVenue(null);
          return true;
        }}
        isUpdating={false}
      />
      
      {/* Venue Hours Dialog */}
      <VenueHoursDialog
        open={venueForHours !== null}
        onOpenChange={(open) => {
          if (!open) setVenueForHours(null);
        }}
        venue={venueForHours}
      />
    </div>
  );
};
