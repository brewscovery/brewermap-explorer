
import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { SortDirection, SortField } from './types';

interface SortIndicatorProps {
  field: SortField;
  currentSortField: SortField;
  sortDirection: SortDirection;
}

const SortIndicator = ({ field, currentSortField, sortDirection }: SortIndicatorProps) => {
  if (currentSortField !== field) return null;
  
  return sortDirection === 'asc' 
    ? <ArrowUp className="ml-1 h-4 w-4" /> 
    : <ArrowDown className="ml-1 h-4 w-4" />;
};

export default SortIndicator;
