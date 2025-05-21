import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import { useVenueSearch } from '@/hooks/useVenueSearch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Search, MapPin, X } from 'lucide-react';
import type { Venue } from '@/types/venue';

interface EnhancedSearchBarProps {
  onVenueSelect: (venue: Venue | null) => void;
  className?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  selectedVenue?: Venue | null;
}

interface EnhancedSearchBarHandle {
  resetSearch: () => void;
}

const EnhancedSearchBar = forwardRef<EnhancedSearchBarHandle, EnhancedSearchBarProps>(({ 
  onVenueSelect, 
  className,
  leftIcon,
  rightIcon,
  selectedVenue = null
}, ref) => {
  const [searchText, setSearchText] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [initialRender, setInitialRender] = useState(true);
  const { venues, isLoading, searchTerm, updateSearch } = useVenueSearch();
  const inputRef = useRef<HTMLInputElement>(null);

  // Expose the resetSearch method
  useImperativeHandle(ref, () => ({
    resetSearch: () => {
      setSearchText('');
      updateSearch('', 'name');
    }
  }));

  // Reset search when selectedVenue becomes null
  useEffect(() => {
    if (!selectedVenue && !initialRender) {
      setSearchText('');
      updateSearch('', 'name');
    }
    
    if (initialRender) {
      setInitialRender(false);
    }
  }, [selectedVenue, initialRender, updateSearch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    
    if (value.trim()) {
      updateSearch(value, 'name');
      setIsOpen(true);
    } else {
      setIsOpen(false);
      onVenueSelect(null);
    }
  };

  const handleVenueSelect = (venue: Venue) => {
    setSearchText(venue.name);
    setIsOpen(false);
    onVenueSelect(venue);
  };

  const clearSearch = () => {
    setSearchText('');
    setIsOpen(false);
    onVenueSelect(null);
    // Focus the input after clearing
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  // Handle open state change without losing focus
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    // Keep focus on input if closing dropdown
    if (!open && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  };

  const renderResults = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      );
    }

    if (venues.length === 0) {
      return (
        <div className="p-4 text-center text-muted-foreground">
          No venues found
        </div>
      );
    }

    return venues.map((venue) => (
      <div
        key={venue.id}
        className="p-3 hover:bg-muted cursor-pointer border-b last:border-0"
        onClick={() => handleVenueSelect(venue)}
      >
        <div className="flex items-start">
          <MapPin className="h-4 w-4 mr-2 mt-1 text-muted-foreground" />
          <div>
            <p className="font-medium">{venue.name}</p>
            <p className="text-sm text-muted-foreground">
              {venue.street}, {venue.city}, {venue.country}
            </p>
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div className={className}>
      <Popover open={isOpen && searchText.trim().length > 0} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <div className="relative flex items-center rounded-md shadow-sm">
            {leftIcon && (
              <div className="absolute left-3 flex items-center pointer-events-none z-10">
                {leftIcon}
              </div>
            )}
            
            <Input
              ref={inputRef}
              type="text"
              placeholder="Search venues..."
              className={`pr-9 ${leftIcon ? 'pl-9' : ''} ${rightIcon ? 'pr-9' : ''}`}
              value={searchText}
              onChange={handleSearchChange}
            />
            
            {searchText && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={clearSearch}
                className="absolute right-9 h-full p-0 hover:bg-transparent"
              >
                <X className="h-4 w-4 text-muted-foreground" />
                <span className="sr-only">Clear</span>
              </Button>
            )}
            
            {rightIcon && (
              <div className="absolute right-3 flex items-center">
                {rightIcon}
              </div>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 max-h-[300px] overflow-auto" align="start">
          {renderResults()}
        </PopoverContent>
      </Popover>
    </div>
  );
});

EnhancedSearchBar.displayName = 'EnhancedSearchBar';

export default EnhancedSearchBar;
