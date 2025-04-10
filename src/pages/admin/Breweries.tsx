
import React, { useState, useEffect, useMemo } from 'react';
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
  Trash2,
  Filter,
  ArrowUp,
  ArrowDown,
  Globe
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Import the debugging utilities but don't automatically use them
import '@/utils/debugUtils';

// Type for sorting options
type SortField = 'name' | 'brewery_type' | 'venue_count' | 'is_verified' | 'created_at' | 'country';
type SortDirection = 'asc' | 'desc';

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
  
  // State for sorting and filtering
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [verificationFilter, setVerificationFilter] = useState<string>('all');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  
  // Cleanup useEffect for component unmount
  useEffect(() => {
    return () => {
      // Final cleanup
      setCreateDialogOpen(false);
      setEditDialogOpen(false);
      setDeleteDialogOpen(false);
      setVenueManagementOpen(false);
      setSelectedBrewery(null);
      
      // Force document.body to be scrollable again in case a dialog left it locked
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
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
    console.log('Editing brewery with data:', brewery);
    setSelectedBrewery(brewery);
    setEditDialogOpen(true);
  };
  
  const handleDeleteBrewery = (brewery: BreweryData) => {
    setSelectedBrewery(brewery);
    setDeleteDialogOpen(true);
  };
  
  const handleManageVenues = (brewery: BreweryData) => {
    setSelectedBrewery(brewery);
    setVenueManagementOpen(true);
  };
  
  // Sort and filter handlers
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Sorting indicator component
  const SortIndicator = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    
    return sortDirection === 'asc' 
      ? <ArrowUp className="ml-1 h-4 w-4" /> 
      : <ArrowDown className="ml-1 h-4 w-4" />;
  };
  
  // Modified handlers with improved cleanup
  const handleEditDialogOpenChange = (open: boolean) => {
    setEditDialogOpen(open);
    if (!open) {
      // Add a slight delay before clearing selected brewery to ensure proper unmounting
      setTimeout(() => {
        setSelectedBrewery(null);
      }, 300);
    }
  };
  
  const handleDeleteDialogOpenChange = (open: boolean) => {
    setDeleteDialogOpen(open);
    if (!open) {
      setTimeout(() => {
        setSelectedBrewery(null);
      }, 100);
    }
  };
  
  const handleVenueManagementOpenChange = (open: boolean) => {
    setVenueManagementOpen(open);
    if (!open) {
      setTimeout(() => {
        setSelectedBrewery(null);
      }, 100);
    }
  };
  
  // Extract unique countries for the country filter
  const countries = useMemo(() => {
    if (!breweries) return [];
    
    const countrySet = new Set<string>();
    breweries.forEach(brewery => {
      const country = brewery.country || 'Unknown';
      countrySet.add(country);
    });
    
    return Array.from(countrySet).sort();
  }, [breweries]);
  
  // Filter and sort the breweries
  const filteredAndSortedBreweries = useMemo(() => {
    if (!breweries) return [];
    
    // First apply filters
    let filtered = [...breweries];
    
    if (typeFilter !== 'all') {
      filtered = filtered.filter(brewery => brewery.brewery_type === typeFilter);
    }
    
    if (verificationFilter !== 'all') {
      const isVerified = verificationFilter === 'verified';
      filtered = filtered.filter(brewery => brewery.is_verified === isVerified);
    }
    
    if (countryFilter !== 'all') {
      filtered = filtered.filter(brewery => {
        const breweryCountry = brewery.country || 'Unknown';
        return breweryCountry === countryFilter;
      });
    }
    
    // Then apply sorting
    return filtered.sort((a, b) => {
      // Handle different field types
      if (sortField === 'name' || sortField === 'brewery_type' || sortField === 'country') {
        const aValue = ((a[sortField] as string) || '').toLowerCase();
        const bValue = ((b[sortField] as string) || '').toLowerCase();
        
        if (sortDirection === 'asc') {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      }
      
      if (sortField === 'venue_count') {
        const aCount = a.venue_count || 0;
        const bCount = b.venue_count || 0;
        
        return sortDirection === 'asc' ? aCount - bCount : bCount - aCount;
      }
      
      if (sortField === 'is_verified') {
        // Convert boolean to number for sorting
        const aValue = a.is_verified ? 1 : 0;
        const bValue = b.is_verified ? 1 : 0;
        
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      if (sortField === 'created_at') {
        const aDate = new Date(a.created_at).getTime();
        const bDate = new Date(b.created_at).getTime();
        
        return sortDirection === 'asc' ? aDate - bDate : bDate - aDate;
      }
      
      return 0;
    });
  }, [breweries, sortField, sortDirection, typeFilter, verificationFilter, countryFilter]);
  
  // Extract unique brewery types for filter dropdown
  const breweryTypes = useMemo(() => {
    if (!breweries) return [];
    
    const types = new Set<string>();
    breweries.forEach(brewery => {
      if (brewery.brewery_type) {
        types.add(brewery.brewery_type);
      }
    });
    
    return Array.from(types);
  }, [breweries]);
  
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
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Brewery
          </Button>
        </div>
      </div>
      
      {/* Filtering options */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters:</span>
        </div>
        
        <div className="flex gap-2 items-center">
          <span className="text-sm">Type:</span>
          <Select
            value={typeFilter}
            onValueChange={setTypeFilter}
          >
            <SelectTrigger className="w-[140px] h-8">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {breweryTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-2 items-center">
          <span className="text-sm">Status:</span>
          <Select 
            value={verificationFilter}
            onValueChange={setVerificationFilter}
          >
            <SelectTrigger className="w-[140px] h-8">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="unverified">Unverified</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-2 items-center">
          <span className="text-sm">Country:</span>
          <Select 
            value={countryFilter}
            onValueChange={setCountryFilter}
          >
            <SelectTrigger className="w-[140px] h-8">
              <SelectValue placeholder="All Countries" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {countries.map(country => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center">
                  Name
                  <SortIndicator field="name" />
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('brewery_type')}
              >
                <div className="flex items-center">
                  Type
                  <SortIndicator field="brewery_type" />
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('country')}
              >
                <div className="flex items-center">
                  Country
                  <SortIndicator field="country" />
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('venue_count')}
              >
                <div className="flex items-center">
                  Venues
                  <SortIndicator field="venue_count" />
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('is_verified')}
              >
                <div className="flex items-center">
                  Verified
                  <SortIndicator field="is_verified" />
                </div>
              </TableHead>
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
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-10" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-9 w-10" /></TableCell>
                </TableRow>
              ))
            ) : filteredAndSortedBreweries.length > 0 ? (
              filteredAndSortedBreweries.map((brewery) => (
                <TableRow key={brewery.id}>
                  <TableCell className="font-medium">{brewery.name}</TableCell>
                  <TableCell>{getBreweryTypeBadge(brewery.brewery_type)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span>{brewery.country || 'Unknown'}</span>
                    </div>
                  </TableCell>
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
                <TableCell colSpan={7} className="h-24 text-center">
                  {searchQuery || typeFilter !== 'all' || verificationFilter !== 'all' || countryFilter !== 'all' 
                    ? 'No breweries found matching your filters.' 
                    : 'No breweries found.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Only render dialogs when they're open - with extra defensive checks */}
      {createDialogOpen && (
        <AdminBreweryDialog 
          open={createDialogOpen}
          onOpenChange={(open) => {
            setCreateDialogOpen(open);
          }}
          mode="create"
        />
      )}
      
      {editDialogOpen && selectedBrewery && (
        <AdminBreweryDialog 
          open={editDialogOpen}
          onOpenChange={handleEditDialogOpenChange}
          brewery={selectedBrewery}
          mode="edit"
        />
      )}
      
      {deleteDialogOpen && selectedBrewery && (
        <DeleteBreweryDialog 
          open={deleteDialogOpen}
          onOpenChange={handleDeleteDialogOpenChange}
          breweryId={selectedBrewery.id || ''}
          breweryName={selectedBrewery.name || ''}
        />
      )}
      
      {venueManagementOpen && selectedBrewery && (
        <AdminVenueManagement
          open={venueManagementOpen}
          onOpenChange={handleVenueManagementOpenChange}
          breweryId={selectedBrewery.id || ''}
          breweryName={selectedBrewery.name || ''}
        />
      )}
    </div>
  );
};

export default BreweriesManagement;
