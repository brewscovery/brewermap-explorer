
import React from 'react';
import { 
  Table, 
  TableBody 
} from '@/components/ui/table';
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis
} from '@/components/ui/pagination';
import BreweriesTableHeader from './BreweriesTableHeader';
import BreweryTableRow from './BreweryTableRow';
import LoadingStateRows from './LoadingStateRows';
import EmptyBreweriesState from './EmptyBreweriesState';
import { SortDirection, SortField } from './types';
import type { BreweryData } from '@/hooks/useAdminData';

interface BreweriesTableProps {
  breweries: BreweryData[];
  isLoading: boolean;
  searchQuery: string;
  verificationFilter: string;
  countryFilter: string;
  sortField: SortField;
  sortDirection: SortDirection;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  handleSort: (field: SortField) => void;
  handleEditBrewery: (brewery: BreweryData) => void;
  handleDeleteBrewery: (brewery: BreweryData) => void;
  handleManageVenues: (brewery: BreweryData) => void;
  handleVerificationChange: (breweryId: string, isVerified: boolean) => void;
  onPageChange: (page: number) => void;
}

const BreweriesTable = ({
  breweries,
  isLoading,
  searchQuery,
  verificationFilter,
  countryFilter,
  sortField,
  sortDirection,
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  handleSort,
  handleEditBrewery,
  handleDeleteBrewery,
  handleManageVenues,
  handleVerificationChange,
  onPageChange
}: BreweriesTableProps) => {
  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    
    // Calculate start and end page numbers
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // Add ellipsis and first page if needed
    if (startPage > 1) {
      items.push(
        <PaginationItem key={1}>
          <PaginationLink onClick={() => onPageChange(1)} isActive={currentPage === 1}>
            1
          </PaginationLink>
        </PaginationItem>
      );
      if (startPage > 2) {
        items.push(
          <PaginationItem key="start-ellipsis">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    }
    
    // Add visible page numbers
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink 
            onClick={() => onPageChange(i)} 
            isActive={currentPage === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    // Add ellipsis and last page if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(
          <PaginationItem key="end-ellipsis">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink onClick={() => onPageChange(totalPages)} isActive={currentPage === totalPages}>
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return items;
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <BreweriesTableHeader 
            sortField={sortField}
            sortDirection={sortDirection}
            handleSort={handleSort}
          />
          <TableBody>
            {isLoading ? (
              <LoadingStateRows />
            ) : breweries.length > 0 ? (
              breweries.map((brewery) => (
                <BreweryTableRow
                  key={brewery.id}
                  brewery={brewery}
                  handleEditBrewery={handleEditBrewery}
                  handleDeleteBrewery={handleDeleteBrewery}
                  handleManageVenues={handleManageVenues}
                  handleVerificationChange={handleVerificationChange}
                />
              ))
            ) : (
              <EmptyBreweriesState 
                searchQuery={searchQuery}
                verificationFilter={verificationFilter}
                countryFilter={countryFilter}
              />
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} to{' '}
            {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} results
          </div>
          
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              
              {renderPaginationItems()}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default BreweriesTable;
