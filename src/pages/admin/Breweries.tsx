import React, { useState, useEffect } from 'react';
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
import { 
  CheckCircle, 
  Search, 
  MapPin, 
  MoreHorizontal, 
  X, 
  ExternalLink, 
  Plus, 
  Edit, 
  Trash2 
} from 'lucide-react';
import { useBreweries, useUpdateBreweryVerification } from '@/hooks/useAdminData';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import AdminBreweryDialog from '@/components/admin/brewery/AdminBreweryDialog';
import DeleteBreweryDialog from '@/components/admin/brewery/AdminDeleteBreweryDialog';
import AdminVenueManagement from '@/components/admin/brewery/AdminVenueManagement';
import type { BreweryData } from '@/hooks/useAdminData';
import { logDialogElements } from '@/utils/debugUtils';

// Force import the debugging utilities
import '@/utils/debugUtils';

const BreweriesManagement = () => {
  const { 
    data: breweries, 
    isLoading, 
    error, 
    searchQuery, 
    setSearchQuery 
  } = useBreweries();
  
  const updateVerification = useUpdateBreweryVerification();
  
  // State for brewery dialogs
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [venueManagementOpen, setVenueManagementOpen] = useState(false);
  const [selectedBrewery, setSelectedBrewery] = useState<BreweryData | null>(null);
  
  // DEBUG LOGGING for component lifecycle
  useEffect(() => {
    console.log('DEBUG: BreweriesManagement component mounted');
    return () => {
      console.log('DEBUG: BreweriesManagement component unmounted');
    };
  }, []);
  
  // DEBUG LOGGING for dialog state changes
  useEffect(() => {
    console.log('DEBUG: Dialog states changed:', {
      createDialogOpen,
      editDialogOpen,
      deleteDialogOpen,
      venueManagementOpen,
      hasSelectedBrewery: !!selectedBrewery,
      selectedBreweryId: selectedBrewery?.id
    });
    
    // Extra debugging: Log all dialog elements whenever a dialog state changes
    setTimeout(logDialogElements, 500);
  }, [createDialogOpen, editDialogOpen, deleteDialogOpen, venueManagementOpen, selectedBrewery]);
  
  // New cleanup useEffect specifically for fixing dialog issues
  useEffect(() => {
    return () => {
      // This effect will run on component unmount
      console.log('DEBUG: Final cleanup of all dialog state');
      setCreateDialogOpen(false);
      setEditDialogOpen(false);
      setDeleteDialogOpen(false);
      setVenueManagementOpen(false);
      setSelectedBrewery(null);
      
      // Force document.body to be scrollable again in case a dialog left it locked
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      
      // Extra check for any lingering .fixed-backdrop elements
      const backdrops = document.querySelectorAll('[role="dialog"]');
      console.log(`DEBUG: Found ${backdrops.length} dialog elements during final cleanup`);
      
      // If we were really desperate, we could force-remove them:
      // backdrops.forEach(el => el.remove());
    };
  }, []);
  
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Search is already reactive via the hook
  };
  
  const handleVerificationChange = (breweryId: string, isVerified: boolean) => {
    updateVerification.mutate({ breweryId, isVerified });
  };
  
  const handleEditBrewery = (brewery: BreweryData) => {
    console.log('DEBUG: handleEditBrewery called with brewery:', brewery.id, brewery.name);
    setSelectedBrewery(brewery);
    setEditDialogOpen(true);
  };
  
  const handleDeleteBrewery = (brewery: BreweryData) => {
    console.log('DEBUG: handleDeleteBrewery called with brewery:', brewery.id, brewery.name);
    setSelectedBrewery(brewery);
    setDeleteDialogOpen(true);
  };
  
  const handleManageVenues = (brewery: BreweryData) => {
    console.log('DEBUG: handleManageVenues called with brewery:', brewery.id, brewery.name);
    setSelectedBrewery(brewery);
    setVenueManagementOpen(true);
  };
  
  // Modified handlers with improved cleanup
  const handleEditDialogOpenChange = (open: boolean) => {
    console.log('DEBUG: handleEditDialogOpenChange called with open:', open);
    setEditDialogOpen(open);
    if (!open) {
      // Add a slight delay before clearing selected brewery to ensure proper unmounting
      console.log('DEBUG: Scheduling selectedBrewery cleanup after Edit dialog close');
      
      // First log what's in the DOM
      logDialogElements();
      
      setTimeout(() => {
        console.log('DEBUG: Clearing selectedBrewery after Edit dialog close');
        setSelectedBrewery(null);
        
        // Check DOM again after cleanup
        setTimeout(logDialogElements, 100);
      }, 300); // Increased delay to ensure animations complete
    }
  };
  
  const handleDeleteDialogOpenChange = (open: boolean) => {
    console.log('DEBUG: handleDeleteDialogOpenChange called with open:', open);
    setDeleteDialogOpen(open);
    if (!open) {
      // Add a slight delay before clearing selected brewery to ensure proper unmounting
      console.log('DEBUG: Scheduling selectedBrewery cleanup after Delete dialog close');
      setTimeout(() => {
        console.log('DEBUG: Clearing selectedBrewery after Delete dialog close');
        setSelectedBrewery(null);
      }, 100);
    }
  };
  
  const handleVenueManagementOpenChange = (open: boolean) => {
    console.log('DEBUG: handleVenueManagementOpenChange called with open:', open);
    setVenueManagementOpen(open);
    if (!open) {
      // Add a slight delay before clearing selected brewery to ensure proper unmounting
      console.log('DEBUG: Scheduling selectedBrewery cleanup after Venue Management dialog close');
      setTimeout(() => {
        console.log('DEBUG: Clearing selectedBrewery after Venue Management dialog close');
        setSelectedBrewery(null);
      }, 100);
    }
  };
  
  const getBreweryTypeBadge = (type: string | null) => {
    if (!type) return null;
    
    const types: Record<string, { label: string, className: string }> = {
      micro: { 
        label: 'Micro', 
        className: 'bg-blue-100 text-blue-800 border-blue-300' 
      },
      regional: { 
        label: 'Regional', 
        className: 'bg-green-100 text-green-800 border-green-300' 
      },
      brewpub: { 
        label: 'Brewpub', 
        className: 'bg-amber-100 text-amber-800 border-amber-300' 
      },
      large: { 
        label: 'Large', 
        className: 'bg-purple-100 text-purple-800 border-purple-300' 
      },
      contract: { 
        label: 'Contract', 
        className: 'bg-indigo-100 text-indigo-800 border-indigo-300' 
      },
      proprietor: { 
        label: 'Proprietor', 
        className: 'bg-pink-100 text-pink-800 border-pink-300' 
      }
    };
    
    const breweryType = types[type.toLowerCase()] || {
      label: type, 
      className: 'bg-gray-100 text-gray-800 border-gray-300'
    };
    
    return (
      <Badge variant="outline" className={breweryType.className}>
        {breweryType.label}
      </Badge>
    );
  };
  
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Breweries Management</h1>
        </div>
        <div className="p-4 border rounded-md bg-red-50 text-red-800">
          Error loading breweries: {error.message}
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Breweries Management</h1>
        <div className="flex gap-2">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search breweries..."
                className="pl-8 w-[250px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button type="submit" variant="outline" size="sm">Search</Button>
          </form>
          <Button onClick={() => {
            console.log('DEBUG: Create brewery button clicked');
            setCreateDialogOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Brewery
          </Button>
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Venues</TableHead>
              <TableHead>Verified</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-10" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-9 w-10" /></TableCell>
                </TableRow>
              ))
            ) : breweries && breweries.length > 0 ? (
              breweries.map((brewery) => (
                <TableRow key={brewery.id}>
                  <TableCell className="font-medium">{brewery.name}</TableCell>
                  <TableCell>{getBreweryTypeBadge(brewery.brewery_type)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{brewery.venue_count || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {brewery.is_verified ? (
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                        <CheckCircle className="mr-1 h-3 w-3" /> Verified
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
                        <X className="mr-1 h-3 w-3" /> Unverified
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {brewery.owner_name || 'No owner'}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleEditBrewery(brewery)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Brewery
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleManageVenues(brewery)}>
                          <MapPin className="mr-2 h-4 w-4" />
                          Manage Venues
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleVerificationChange(brewery.id, !brewery.is_verified)}
                        >
                          {brewery.is_verified ? (
                            <>
                              <X className="mr-2 h-4 w-4" />
                              Mark as Unverified
                            </>
                          ) : (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Mark as Verified
                            </>
                          )}
                        </DropdownMenuItem>
                        {brewery.website_url && (
                          <DropdownMenuItem>
                            <a 
                              href={brewery.website_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center w-full"
                            >
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Visit Website
                            </a>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDeleteBrewery(brewery)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Brewery
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  {searchQuery ? 'No breweries found matching your search.' : 'No breweries found.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Only render dialogs when they're open - with extra defensive checks */}
      {createDialogOpen && (
        <>
          {console.log('DEBUG: Rendering create dialog')}
          <AdminBreweryDialog 
            open={createDialogOpen}
            onOpenChange={(open) => {
              console.log('DEBUG: Create dialog onOpenChange called with open:', open);
              setCreateDialogOpen(open);
              
              // Extra check for DOM elements after state change
              setTimeout(logDialogElements, 200);
            }}
            mode="create"
          />
        </>
      )}
      
      {editDialogOpen && selectedBrewery && (
        <>
          {console.log('DEBUG: Rendering edit dialog for brewery:', selectedBrewery.id)}
          <AdminBreweryDialog 
            open={editDialogOpen}
            onOpenChange={handleEditDialogOpenChange}
            brewery={selectedBrewery}
            mode="edit"
          />
        </>
      )}
      
      {deleteDialogOpen && selectedBrewery && (
        <>
          {console.log('DEBUG: Rendering delete dialog for brewery:', selectedBrewery.id)}
          <DeleteBreweryDialog 
            open={deleteDialogOpen}
            onOpenChange={handleDeleteDialogOpenChange}
            breweryId={selectedBrewery.id || ''}
            breweryName={selectedBrewery.name || ''}
          />
        </>
      )}
      
      {venueManagementOpen && selectedBrewery && (
        <>
          {console.log('DEBUG: Rendering venue management dialog for brewery:', selectedBrewery.id)}
          <AdminVenueManagement
            open={venueManagementOpen}
            onOpenChange={handleVenueManagementOpenChange}
            breweryId={selectedBrewery.id || ''}
            breweryName={selectedBrewery.name || ''}
          />
        </>
      )}
    </div>
  );
};

export default BreweriesManagement;
