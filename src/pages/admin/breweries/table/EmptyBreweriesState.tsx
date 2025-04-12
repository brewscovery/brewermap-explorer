
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';

interface EmptyBreweriesStateProps {
  searchQuery: string;
  typeFilter: string;
  verificationFilter: string;
  countryFilter: string;
  colSpan?: number;
}

const EmptyBreweriesState = ({
  searchQuery,
  typeFilter,
  verificationFilter,
  countryFilter,
  colSpan = 7
}: EmptyBreweriesStateProps) => {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="h-24 text-center">
        {searchQuery || typeFilter !== 'all' || verificationFilter !== 'all' || countryFilter !== 'all' 
          ? 'No breweries found matching your filters.' 
          : 'No breweries found.'}
      </TableCell>
    </TableRow>
  );
};

export default EmptyBreweriesState;
