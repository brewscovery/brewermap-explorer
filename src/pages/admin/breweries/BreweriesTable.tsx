
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  X, 
  MoreHorizontal, 
  ExternalLink, 
  Edit, 
  Trash2,
  MapPin,
  Globe,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { getBreweryTypeBadge } from './BreweryTypeUtils';
import type { BreweryData } from '@/hooks/useAdminData';

// Type for sorting options
type SortField = 'name' | 'brewery_type' | 'venue_count' | 'is_verified' | 'created_at' | 'country';
type SortDirection = 'asc' | 'desc';

interface BreweriesTableProps {
  breweries: BreweryData[];
  isLoading: boolean;
  searchQuery: string;
  typeFilter: string;
  verificationFilter: string;
  countryFilter: string;
  sortField: SortField;
  sortDirection: SortDirection;
  handleSort: (field: SortField) => void;
  handleEditBrewery: (brewery: BreweryData) => void;
  handleDeleteBrewery: (brewery: BreweryData) => void;
  handleManageVenues: (brewery: BreweryData) => void;
  handleVerificationChange: (breweryId: string, isVerified: boolean) => void;
}

const SortIndicator = ({ field, currentSortField, sortDirection }: { 
  field: SortField, 
  currentSortField: SortField, 
  sortDirection: SortDirection 
}) => {
  if (currentSortField !== field) return null;
  
  return sortDirection === 'asc' 
    ? <ArrowUp className="ml-1 h-4 w-4" /> 
    : <ArrowDown className="ml-1 h-4 w-4" />;
};

const BreweriesTable = ({
  breweries,
  isLoading,
  searchQuery,
  typeFilter,
  verificationFilter,
  countryFilter,
  sortField,
  sortDirection,
  handleSort,
  handleEditBrewery,
  handleDeleteBrewery,
  handleManageVenues,
  handleVerificationChange
}: BreweriesTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead 
              className="cursor-pointer"
              onClick={() => handleSort('name')}
            >
              <div className="flex items-center">
                Name
                <SortIndicator field="name" currentSortField={sortField} sortDirection={sortDirection} />
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer"
              onClick={() => handleSort('brewery_type')}
            >
              <div className="flex items-center">
                Type
                <SortIndicator field="brewery_type" currentSortField={sortField} sortDirection={sortDirection} />
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer"
              onClick={() => handleSort('country')}
            >
              <div className="flex items-center">
                Country
                <SortIndicator field="country" currentSortField={sortField} sortDirection={sortDirection} />
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer"
              onClick={() => handleSort('venue_count')}
            >
              <div className="flex items-center">
                Venues
                <SortIndicator field="venue_count" currentSortField={sortField} sortDirection={sortDirection} />
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer"
              onClick={() => handleSort('is_verified')}
            >
              <div className="flex items-center">
                Verified
                <SortIndicator field="is_verified" currentSortField={sortField} sortDirection={sortDirection} />
              </div>
            </TableHead>
            <TableHead>Owner</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                <TableCell><Skeleton className="h-5 w-10" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                <TableCell><Skeleton className="h-9 w-10" /></TableCell>
              </TableRow>
            ))
          ) : breweries.length > 0 ? (
            breweries.map((brewery) => (
              <TableRow key={brewery.id}>
                <TableCell className="font-medium">{brewery.name}</TableCell>
                <TableCell>{getBreweryTypeBadge(brewery.brewery_type)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span>{brewery.country || 'Unknown'}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{brewery.venue_count || 0}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {brewery.is_verified ? (
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                      <CheckCircle className="mr-1 h-3 w-3" /> Verified
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
                      <X className="mr-1 h-3 w-3" /> Unverified
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {brewery.owner_name || 'No owner'}
                </TableCell>
                <TableCell className="text-right">
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
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                {searchQuery || typeFilter !== 'all' || verificationFilter !== 'all' || countryFilter !== 'all' 
                  ? 'No breweries found matching your filters.' 
                  : 'No breweries found.'}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default BreweriesTable;
