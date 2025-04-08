
import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, AlertCircle, Clock, Eye } from 'lucide-react';
import { useBreweryClaims, useBreweryClaimUpdate, BreweryClaim } from '@/hooks/useAdminData';
import { format } from 'date-fns';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

const ClaimsManagement = () => {
  const { data: claims, isLoading, error } = useBreweryClaims();
  const [selectedClaim, setSelectedClaim] = useState<BreweryClaim | null>(null);
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [isDecisionDialogOpen, setIsDecisionDialogOpen] = useState<boolean>(false);
  const [pendingDecision, setPendingDecision] = useState<'approved' | 'rejected' | null>(null);
  
  const updateClaimMutation = useBreweryClaimUpdate();
  
  const handleOpenDetail = (claim: BreweryClaim) => {
    setSelectedClaim(claim);
    setAdminNotes(claim.admin_notes || '');
    setIsDetailOpen(true);
  };
  
  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedClaim(null);
  };
  
  const handleOpenDecisionDialog = (claim: BreweryClaim, decision: 'approved' | 'rejected') => {
    setSelectedClaim(claim);
    setAdminNotes(claim.admin_notes || '');
    setPendingDecision(decision);
    setIsDecisionDialogOpen(true);
  };
  
  const handleSaveNotes = async () => {
    if (!selectedClaim) return;
    
    try {
      await updateClaimMutation.mutateAsync({
        claimId: selectedClaim.id,
        status: selectedClaim.status,
        adminNotes: adminNotes
      });
      toast.success('Notes updated successfully');
    } catch (error) {
      toast.error('Failed to update notes');
    }
  };
  
  const handleMakeDecision = async () => {
    if (!selectedClaim || !pendingDecision) return;
    
    try {
      await updateClaimMutation.mutateAsync({
        claimId: selectedClaim.id,
        status: pendingDecision,
        adminNotes: adminNotes
      });
      
      toast.success(
        pendingDecision === 'approved'
          ? 'Claim approved successfully'
          : 'Claim rejected successfully'
      );
      
      setIsDecisionDialogOpen(false);
      setPendingDecision(null);
    } catch (error) {
      toast.error('Failed to process claim');
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="flex items-center gap-1 bg-yellow-100 text-yellow-800 border-yellow-300"><Clock className="h-3 w-3" /> Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="flex items-center gap-1 bg-green-100 text-green-800 border-green-300"><Check className="h-3 w-3" /> Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="flex items-center gap-1 bg-red-100 text-red-800 border-red-300"><X className="h-3 w-3" /> Rejected</Badge>;
      default:
        return <Badge variant="outline"><AlertCircle className="h-3 w-3" /> {status}</Badge>;
    }
  };
  
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Brewery Claims Management</h1>
        </div>
        <div className="p-4 border rounded-md bg-red-50 text-red-800">
          Error loading claims: {error.message}
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Brewery Claims Management</h1>
      </div>
      
      <div className="rounded-md border">
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
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-9 w-full" /></TableCell>
                </TableRow>
              ))
            ) : claims && claims.length > 0 ? (
              claims.map((claim) => (
                <TableRow key={claim.id}>
                  <TableCell className="font-medium">{claim.brewery?.name || 'Unknown Brewery'}</TableCell>
                  <TableCell>
                    {claim.user?.first_name && claim.user?.last_name
                      ? `${claim.user.first_name} ${claim.user.last_name}`
                      : 'Unknown User'}
                  </TableCell>
                  <TableCell>
                    {claim.contact_email || claim.contact_phone || 'No contact info'}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(claim.status)}
                  </TableCell>
                  <TableCell>
                    {format(new Date(claim.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleOpenDetail(claim)}
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
                            onClick={() => handleOpenDecisionDialog(claim, 'approved')}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700"
                            onClick={() => handleOpenDecisionDialog(claim, 'rejected')}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No brewery claims found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Claim Details Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Claim Details</DialogTitle>
            <DialogDescription>
              Viewing details for brewery claim
            </DialogDescription>
          </DialogHeader>
          
          {selectedClaim && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-sm">Brewery</h3>
                  <p>{selectedClaim.brewery?.name || 'Unknown Brewery'}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Status</h3>
                  <div className="mt-1">
                    {getStatusBadge(selectedClaim.status)}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Claimed By</h3>
                  <p>
                    {selectedClaim.user?.first_name && selectedClaim.user?.last_name
                      ? `${selectedClaim.user.first_name} ${selectedClaim.user.last_name}`
                      : 'Unknown User'}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Submitted On</h3>
                  <p>{format(new Date(selectedClaim.created_at), 'PPpp')}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Contact Email</h3>
                  <p>{selectedClaim.contact_email || 'Not provided'}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Contact Phone</h3>
                  <p>{selectedClaim.contact_phone || 'Not provided'}</p>
                </div>
                
                {selectedClaim.decision_at && (
                  <div className="col-span-2">
                    <h3 className="font-semibold text-sm">Decision Date</h3>
                    <p>{format(new Date(selectedClaim.decision_at), 'PPpp')}</p>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Admin Notes</h3>
                <Textarea 
                  value={adminNotes} 
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this claim..."
                  rows={4}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              onClick={handleSaveNotes}
              disabled={selectedClaim?.admin_notes === adminNotes}
            >
              Save Notes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Decision Confirmation Dialog */}
      <Dialog open={isDecisionDialogOpen} onOpenChange={setIsDecisionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pendingDecision === 'approved' 
                ? 'Approve Brewery Claim' 
                : 'Reject Brewery Claim'}
            </DialogTitle>
            <DialogDescription>
              {pendingDecision === 'approved'
                ? 'This will grant the user ownership of the brewery.'
                : 'This will deny the user\'s claim to the brewery.'}
            </DialogDescription>
          </DialogHeader>
          
          {selectedClaim && (
            <div className="space-y-4 py-4">
              <div>
                <p><span className="font-medium">Brewery:</span> {selectedClaim.brewery?.name}</p>
                <p><span className="font-medium">Claimed by:</span> {
                  selectedClaim.user?.first_name && selectedClaim.user?.last_name
                    ? `${selectedClaim.user.first_name} ${selectedClaim.user.last_name}`
                    : 'Unknown User'
                }</p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Admin Notes</h3>
                <Textarea 
                  value={adminNotes} 
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this decision..."
                  rows={4}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              onClick={handleMakeDecision}
              variant={pendingDecision === 'approved' ? 'default' : 'destructive'}
              disabled={updateClaimMutation.isPending}
            >
              {updateClaimMutation.isPending 
                ? 'Processing...' 
                : pendingDecision === 'approved' 
                  ? 'Approve Claim' 
                  : 'Reject Claim'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClaimsManagement;
