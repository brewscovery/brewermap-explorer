
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import VenueManagement from '@/components/brewery/VenueManagement';
import AddVenueDialog from '@/components/brewery/AddVenueDialog';
import { Brewery } from '@/types/brewery';

interface VenueListViewProps {
  brewery: Brewery;
  onVenueAdded: () => void;
}

export const VenueListView = ({ brewery, onVenueAdded }: VenueListViewProps) => {
  const navigate = useNavigate();
  const [showAddVenueDialog, setShowAddVenueDialog] = useState(false);
  
  const handleAddVenueDialogClose = () => {
    setShowAddVenueDialog(false);
  };
  
  const handleVenueAdded = () => {
    onVenueAdded();
    handleAddVenueDialogClose();
  };
  
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">Venues for {brewery.name}</h2>
          <p className="text-sm text-muted-foreground">
            Manage the locations where customers can find your products
          </p>
        </div>
        {brewery.is_verified && (
          <Button onClick={() => setShowAddVenueDialog(true)}>
            <PlusCircle className="mr-2" size={18} />
            Add Venue
          </Button>
        )}
      </div>
      
      <VenueManagement breweryId={brewery.id} />
      
      {brewery.id && brewery.is_verified && (
        <AddVenueDialog
          open={showAddVenueDialog}
          onOpenChange={handleAddVenueDialogClose}
          breweryId={brewery.id}
          onVenueAdded={handleVenueAdded}
        />
      )}
    </div>
  );
};
