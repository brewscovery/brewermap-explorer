
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';

interface EmptyBreweriesStateProps {
  searchQuery: string;
  verificationFilter: string;
  countryFilter: string;
}

const EmptyBreweriesState = ({ 
  searchQuery, 
  verificationFilter, 
  countryFilter
}: EmptyBreweriesStateProps) => {
  // Generate a message based on active filters
  const generateMessage = () => {
    const filters = [];
    
    if (searchQuery) {
      filters.push(`search term "${searchQuery}"`);
    }
    
    if (verificationFilter !== 'all') {
      filters.push(`${verificationFilter} status`);
    }
    
    if (countryFilter !== 'all') {
      filters.push(`country "${countryFilter}"`);
    }
    
    if (filters.length === 0) {
      return 'No breweries found. Add one to get started.';
    } else {
      return `No breweries match the ${filters.join(' and ')}.`;
    }
  };

  return (
    <TableRow>
      <TableCell colSpan={6} className="h-24 text-center">
        <div className="flex flex-col items-center justify-center py-4">
          <p className="text-sm text-muted-foreground">{generateMessage()}</p>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default EmptyBreweriesState;
