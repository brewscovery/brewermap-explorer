
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { BreweryClaim } from '@/types/admin';
import { ClaimsTableActions } from './ClaimsTableActions';
import { ClaimStatusBadge } from './ClaimStatusBadge';
import { Skeleton } from '@/components/ui/skeleton';

interface ClaimsTableProps {
  claims: BreweryClaim[] | undefined;
  isLoading: boolean;
  onViewDetails: (claim: BreweryClaim) => void;
  onApprove: (claim: BreweryClaim) => void;
  onReject: (claim: BreweryClaim) => void;
}

export const ClaimsTable = ({ 
  claims, 
  isLoading, 
  onViewDetails, 
  onApprove, 
  onReject 
}: ClaimsTableProps) => {
  if (isLoading) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Brewery</TableHead>
            <TableHead>Claimed By</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell><Skeleton className="h-5 w-full" /></TableCell>
              <TableCell><Skeleton className="h-5 w-full" /></TableCell>
              <TableCell><Skeleton className="h-5 w-full" /></TableCell>
              <TableCell><Skeleton className="h-5 w-20" /></TableCell>
              <TableCell><Skeleton className="h-5 w-24" /></TableCell>
              <TableCell><Skeleton className="h-9 w-full" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  if (!claims || claims.length === 0) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Brewery</TableHead>
            <TableHead>Claimed By</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colSpan={6} className="h-24 text-center">
              No brewery claims found.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Brewery</TableHead>
          <TableHead>Claimed By</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {claims.map((claim) => (
          <TableRow key={claim.id}>
            <TableCell className="font-medium">{claim.brewery_name || 'Unknown Brewery'}</TableCell>
            <TableCell>{claim.user_name || 'Unknown User'}</TableCell>
            <TableCell>
              {claim.contact_email || claim.contact_phone || 'No contact info'}
            </TableCell>
            <TableCell>
              <ClaimStatusBadge status={claim.status} />
            </TableCell>
            <TableCell>
              {format(new Date(claim.created_at), 'MMM d, yyyy')}
            </TableCell>
            <TableCell className="text-right">
              <ClaimsTableActions 
                claim={claim}
                onViewDetails={onViewDetails}
                onApprove={onApprove}
                onReject={onReject}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
