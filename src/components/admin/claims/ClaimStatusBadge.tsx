
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Check, Clock, X } from 'lucide-react';

interface ClaimStatusBadgeProps {
  status: string;
}

export const ClaimStatusBadge = ({ status }: ClaimStatusBadgeProps) => {
  switch (status) {
    case 'pending':
      return (
        <Badge variant="outline" className="flex items-center gap-1 bg-yellow-100 text-yellow-800 border-yellow-300">
          <Clock className="h-3 w-3" /> Pending
        </Badge>
      );
    case 'approved':
      return (
        <Badge variant="outline" className="flex items-center gap-1 bg-green-100 text-green-800 border-green-300">
          <Check className="h-3 w-3" /> Approved
        </Badge>
      );
    case 'rejected':
      return (
        <Badge variant="outline" className="flex items-center gap-1 bg-red-100 text-red-800 border-red-300">
          <X className="h-3 w-3" /> Rejected
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};
