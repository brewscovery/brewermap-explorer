
import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TableHeaderProps {
  label: string;
  sortField: string;
  currentSort: string;
  sortDirection: 'asc' | 'desc';
  onSort: () => void;
}

export const TableHeader: React.FC<TableHeaderProps> = ({
  label,
  sortField,
  currentSort,
  sortDirection,
  onSort,
}) => {
  const isActive = sortField === currentSort;

  return (
    <th className="py-1">
      <button
        onClick={onSort}
        className={cn(
          "flex items-center gap-1 text-left text-muted-foreground hover:text-foreground",
          isActive && "text-foreground font-medium"
        )}
      >
        {label}
        <span className="flex flex-col">
          <ChevronUp
            size={14}
            className={cn(
              "text-muted-foreground/40",
              isActive && sortDirection === 'asc' && "text-foreground"
            )}
          />
          <ChevronDown
            size={14}
            className={cn(
              "text-muted-foreground/40",
              isActive && sortDirection === 'desc' && "text-foreground"
            )}
            style={{ marginTop: -4 }}
          />
        </span>
      </button>
    </th>
  );
};
