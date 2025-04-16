
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, Eye, X } from 'lucide-react';
import { BreweryClaim } from '@/types/admin';

interface ClaimsTableActionsProps {
  claim: BreweryClaim;
  onViewDetails: (claim: BreweryClaim) => void;
  onApprove: (claim: BreweryClaim) => void;
  onReject: (claim: BreweryClaim) => void;
}

export const ClaimsTableActions = ({
  claim,
  onViewDetails,
  onApprove,
  onReject,
}: ClaimsTableActionsProps) => {
  return (
    <div className="flex justify-end gap-2">
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => onViewDetails(claim)}
      >
        <Eye className="h-4 w-4 mr-1" />
        View
      </Button>
      
      {claim.status === 'pending' && (
        <>
          <Button 
            variant="outline" 
            size="sm"
            className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100 hover:text-green-700"
            onClick={() => onApprove(claim)}
          >
            <Check className="h-4 w-4 mr-1" />
            Approve
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700"
            onClick={() => onReject(claim)}
          >
            <X className="h-4 w-4 mr-1" />
            Reject
          </Button>
        </>
      )}
    </div>
  );
};
