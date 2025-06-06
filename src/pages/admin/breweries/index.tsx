
import React, { useState, useEffect, useMemo } from 'react';
import { useBreweries, useUpdateBreweryVerification } from '@/hooks/useAdminData';
import AdminBreweryDialog from '@/components/admin/brewery/AdminBreweryDialog';
import DeleteBreweryDialog from '@/components/admin/brewery/AdminDeleteBreweryDialog';
import AdminVenueManagement from '@/components/admin/brewery/AdminVenueManagement';
import BreweriesSearchForm from './BreweriesSearchForm';
import BreweriesFilters from './BreweriesFilters';
import { BreweriesTable } from './table';
import type { BreweryData } from '@/hooks/useAdminData';
import { SortDirection, SortField } from './table/types';

const ITEMS_PER_PAGE = 10;

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
  
  // State for sorting, filtering, and pagination
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [verificationFilter, setVerificationFilter] = useState<string>('all');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, verificationFilter, countryFilter, sortField, sortDirection]);
  
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
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
      if (sortField === 'name' || sortField === 'country') {
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
  }, [breweries, sortField, sortDirection, verificationFilter, countryFilter]);
  
  // Calculate pagination
  const totalItems = filteredAndSortedBreweries.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedBreweries = filteredAndSortedBreweries.slice(startIndex, endIndex);
  
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
      <BreweriesSearchForm 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearch}
        onAddBrewery={() => setCreateDialogOpen(true)}
      />
      
      <BreweriesFilters
        verificationFilter={verificationFilter}
        setVerificationFilter={setVerificationFilter}
        countryFilter={countryFilter}
        setCountryFilter={setCountryFilter}
        countries={countries}
      />
      
      <BreweriesTable
        breweries={paginatedBreweries}
        isLoading={isLoading}
        searchQuery={searchQuery}
        verificationFilter={verificationFilter}
        countryFilter={countryFilter}
        sortField={sortField}
        sortDirection={sortDirection}
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={ITEMS_PER_PAGE}
        totalItems={totalItems}
        handleSort={handleSort}
        handleEditBrewery={handleEditBrewery}
        handleDeleteBrewery={handleDeleteBrewery}
        handleManageVenues={handleManageVenues}
        handleVerificationChange={handleVerificationChange}
        onPageChange={handlePageChange}
      />
      
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
