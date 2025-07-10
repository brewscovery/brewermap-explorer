
import React from 'react';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SortField, SortDirection } from './types';
import { ChevronUp, ChevronDown } from 'lucide-react';

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
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    
    return sortDirection === 'asc' ? (
      <ChevronUp className="ml-1 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-1 h-4 w-4" />
    );
  };

  const makeColumn = (field: SortField, label: string) => (
    <TableHead 
      className={`cursor-pointer ${sortField === field ? 'text-primary' : ''}`}
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center">
        {label}
        {renderSortIcon(field)}
      </div>
    </TableHead>
  );

  return (
    <TableHeader>
      <TableRow>
        {makeColumn('name', 'Name')}
        <TableHead>Country</TableHead>
        <TableHead>State</TableHead>
        {makeColumn('venue_count', 'Venues')}
        {makeColumn('is_verified', 'Status')}
        <TableHead>Owner</TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default BreweriesTableHeader;
