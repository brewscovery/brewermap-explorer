
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, X, Globe, MapPin } from 'lucide-react';
import BreweryRowActions from './BreweryRowActions';
import type { BreweryData } from '@/hooks/useAdminData';

interface BreweryTableRowProps {
  brewery: BreweryData;
  handleEditBrewery: (brewery: BreweryData) => void;
  handleDeleteBrewery: (brewery: BreweryData) => void;
  handleManageVenues: (brewery: BreweryData) => void;
  handleVerificationChange: (breweryId: string, isVerified: boolean) => void;
}

const BreweryTableRow = ({
  brewery,
  handleEditBrewery,
  handleDeleteBrewery,
  handleManageVenues,
  handleVerificationChange
}: BreweryTableRowProps) => {
  return (
    <TableRow key={brewery.id}>
      <TableCell className="font-medium">{brewery.name}</TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <span>{brewery.country || 'Unknown'}</span>
        </div>
      </TableCell>
      <TableCell>
        <span>{brewery.state || 'N/A'}</span>
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
        <BreweryRowActions 
          brewery={brewery}
          handleEditBrewery={handleEditBrewery}
          handleDeleteBrewery={handleDeleteBrewery}
          handleManageVenues={handleManageVenues}
          handleVerificationChange={handleVerificationChange}
        />
      </TableCell>
    </TableRow>
  );
};

export default BreweryTableRow;
