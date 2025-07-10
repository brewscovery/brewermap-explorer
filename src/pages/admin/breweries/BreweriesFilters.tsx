
import React from 'react';
import { Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface BreweriesFiltersProps {
  verificationFilter: string;
  setVerificationFilter: (value: string) => void;
  countryFilter: string;
  setCountryFilter: (value: string) => void;
  stateFilter: string;
  setStateFilter: (value: string) => void;
  countries: string[];
  states: string[];
}

const BreweriesFilters = ({
  verificationFilter,
  setVerificationFilter,
  countryFilter,
  setCountryFilter,
  stateFilter,
  setStateFilter,
  countries,
  states,
}: BreweriesFiltersProps) => {
  return (
    <div className="flex flex-wrap gap-4 items-center">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Filters:</span>
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
          <SelectContent className="max-h-[200px] overflow-y-auto">
            <SelectItem value="all">All Countries</SelectItem>
            {countries.map(country => (
              <SelectItem key={country} value={country}>
                {country}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex gap-2 items-center">
        <span className="text-sm">State:</span>
        <Select 
          value={stateFilter}
          onValueChange={setStateFilter}
        >
          <SelectTrigger className="w-[140px] h-8">
            <SelectValue placeholder="All States" />
          </SelectTrigger>
          <SelectContent className="max-h-[200px] overflow-y-auto">
            <SelectItem value="all">All States</SelectItem>
            {states.map(state => (
              <SelectItem key={state} value={state}>
                {state}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default BreweriesFilters;
