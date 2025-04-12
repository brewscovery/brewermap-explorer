
import React from 'react';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import SortIndicator from './SortIndicator';
import { SortDirection, SortField } from './types';

interface BreweriesTableHeaderProps {
  sortField: SortField;
  sortDirection: SortDirection;
  handleSort: (field: SortField) => void;
}

const BreweriesTableHeader = ({
  sortField,
  sortDirection,
  handleSort
}: BreweriesTableHeaderProps) => {
  return (
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
  );
};

export default BreweriesTableHeader;
