
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

interface LoadingStateRowsProps {
  rowCount?: number;
}

const LoadingStateRows = ({ rowCount = 5 }: LoadingStateRowsProps) => {
  return (
    <>
      {Array.from({ length: rowCount }).map((_, index) => (
        <TableRow key={index}>
          <TableCell><Skeleton className="h-5 w-full" /></TableCell>
          <TableCell><Skeleton className="h-5 w-20" /></TableCell>
          <TableCell><Skeleton className="h-5 w-20" /></TableCell>
          <TableCell><Skeleton className="h-5 w-10" /></TableCell>
          <TableCell><Skeleton className="h-5 w-20" /></TableCell>
          <TableCell><Skeleton className="h-5 w-full" /></TableCell>
          <TableCell><Skeleton className="h-9 w-10" /></TableCell>
        </TableRow>
      ))}
    </>
  );
};

export default LoadingStateRows;
