
import React from 'react';
import { 
  Table, 
  TableBody 
} from '@/components/ui/table';
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
  handleSort: (field: SortField) => void;
  handleEditBrewery: (brewery: BreweryData) => void;
  handleDeleteBrewery: (brewery: BreweryData) => void;
  handleManageVenues: (brewery: BreweryData) => void;
  handleVerificationChange: (breweryId: string, isVerified: boolean) => void;
}

const BreweriesTable = ({
  breweries,
  isLoading,
  searchQuery,
  verificationFilter,
  countryFilter,
  sortField,
  sortDirection,
  handleSort,
  handleEditBrewery,
  handleDeleteBrewery,
  handleManageVenues,
  handleVerificationChange
}: BreweriesTableProps) => {
  return (
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
  );
};

export default BreweriesTable;
