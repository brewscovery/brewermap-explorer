
import React from 'react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { 
  MoreHorizontal, 
  Edit, 
  Trash2,
  MapPin,
  CheckCircle,
  X,
  ExternalLink
} from 'lucide-react';
import type { BreweryData } from '@/hooks/useAdminData';

interface BreweryRowActionsProps {
  brewery: BreweryData;
  handleEditBrewery: (brewery: BreweryData) => void;
  handleDeleteBrewery: (brewery: BreweryData) => void;
  handleManageVenues: (brewery: BreweryData) => void;
  handleVerificationChange: (breweryId: string, isVerified: boolean) => void;
}

const BreweryRowActions = ({
  brewery,
  handleEditBrewery,
  handleDeleteBrewery,
  handleManageVenues,
  handleVerificationChange
}: BreweryRowActionsProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleEditBrewery(brewery)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Brewery
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleManageVenues(brewery)}>
          <MapPin className="mr-2 h-4 w-4" />
          Manage Venues
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleVerificationChange(brewery.id, !brewery.is_verified)}
        >
          {brewery.is_verified ? (
            <>
              <X className="mr-2 h-4 w-4" />
              Mark as Unverified
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark as Verified
            </>
          )}
        </DropdownMenuItem>
        {brewery.website_url && (
          <DropdownMenuItem>
            <a 
              href={brewery.website_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center w-full"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Visit Website
            </a>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => handleDeleteBrewery(brewery)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Brewery
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default BreweryRowActions;
