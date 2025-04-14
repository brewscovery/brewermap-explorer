
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Store, 
  Clock, 
  Beer, 
  Utensils, 
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Venue } from '@/types/venue';
import { VenueDetailsTab } from '@/components/brewery/venue-tabs/VenueDetailsTab';
import { VenueHoursTab } from '@/components/brewery/venue-tabs/VenueHoursTab';
import { HappyHoursTab } from '@/components/brewery/venue-tabs/HappyHoursTab';
import { DailySpecialsTab } from '@/components/brewery/venue-tabs/DailySpecialsTab';
import DeleteVenueConfirmDialog from './DeleteVenueConfirmDialog';

interface VenueDetailViewProps {
  venue: Venue;
  isUpdating: boolean;
  isDeleting: boolean;
  onUpdateVenue: (venueId: string, venueData: Partial<Venue>) => Promise<boolean>;
  onDeleteVenue: (venueId: string) => Promise<void>;
}

export const VenueDetailView = ({ 
  venue, 
  isUpdating,
  isDeleting,
  onUpdateVenue,
  onDeleteVenue
}: VenueDetailViewProps) => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("details");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const handleTabChange = (value: string) => {
    setSelectedTab(value);
  };
  
  const handleDeleteVenue = async () => {
    if (!venue) return;
    
    try {
      await onDeleteVenue(venue.id);
    } finally {
      setShowDeleteDialog(false);
    }
  };
  
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">{venue.name}</h2>
          <p className="text-sm text-muted-foreground">
            {venue.city}, {venue.state}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="mr-2" size={16} />
            Delete Venue
          </Button>
          <Button
            onClick={() => navigate('/dashboard/venues')}
            variant="ghost"
            size="sm"
          >
            Back to Venues
          </Button>
        </div>
      </div>
      
      <Tabs value={selectedTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details" className="flex items-center gap-1">
            <Store className="h-4 w-4" />
            <span className="hidden sm:inline">Venue Details</span>
            <span className="sm:hidden">Details</span>
          </TabsTrigger>
          <TabsTrigger value="hours" className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Venue Hours</span>
            <span className="sm:hidden">Hours</span>
          </TabsTrigger>
          <TabsTrigger value="happy-hours" className="flex items-center gap-1">
            <Beer className="h-4 w-4" />
            <span className="hidden sm:inline">Happy Hours</span>
            <span className="sm:hidden">Happy</span>
          </TabsTrigger>
          <TabsTrigger value="specials" className="flex items-center gap-1">
            <Utensils className="h-4 w-4" />
            <span className="hidden sm:inline">Daily Specials</span>
            <span className="sm:hidden">Specials</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="pt-4">
          <VenueDetailsTab 
            venue={venue} 
            onUpdate={onUpdateVenue}
            isUpdating={isUpdating}
          />
        </TabsContent>
        
        <TabsContent value="hours" className="pt-4">
          <VenueHoursTab 
            venue={venue}
          />
        </TabsContent>
        
        <TabsContent value="happy-hours" className="pt-4">
          <HappyHoursTab 
            venue={venue}
          />
        </TabsContent>
        
        <TabsContent value="specials" className="pt-4">
          <DailySpecialsTab 
            venue={venue}
          />
        </TabsContent>
      </Tabs>
      
      <DeleteVenueConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        isDeleting={isDeleting}
        onConfirm={handleDeleteVenue}
        venueName={venue.name}
      />
    </div>
  );
};
