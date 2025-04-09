
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Venue } from "@/types/venue";

interface VenueListProps {
  venues: Venue[];
  isLoading: boolean;
  onDeleteVenue: (venue: Venue) => void;
}

export const VenueList = ({ venues, isLoading, onDeleteVenue }: VenueListProps) => {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, index) => (
          <Skeleton key={index} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (venues.length === 0) {
    return (
      <div className="text-center py-8 border rounded-md">
        <p className="text-muted-foreground">No venues found for this brewery.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {venues.map((venue) => (
            <TableRow key={venue.id}>
              <TableCell className="font-medium">{venue.name}</TableCell>
              <TableCell>
                {venue.city}, {venue.state}
                {venue.country && venue.country !== 'United States' ? `, ${venue.country}` : ''}
              </TableCell>
              <TableCell>
                {venue.phone || 'No phone'}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDeleteVenue(venue)}
                  aria-label={`Delete ${venue.name}`}
                >
                  <Trash className="h-4 w-4 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
