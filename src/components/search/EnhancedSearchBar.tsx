
import { useState, useEffect, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useVenueSearch } from '@/hooks/useVenueSearch';
import type { Venue } from '@/types/venue';

interface EnhancedSearchBarProps {
  onVenueSelect: (venue: Venue) => void;
  className?: string;
}

const EnhancedSearchBar = ({ onVenueSelect, className = '' }: EnhancedSearchBarProps) => {
  const [inputValue, setInputValue] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { 
    venues, 
    isLoading,
    updateSearch
  } = useVenueSearch(inputValue, 'name');

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current && 
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update search results when input changes
  useEffect(() => {
    if (inputValue.length > 0) {
      updateSearch(inputValue, 'name');
      setIsDropdownOpen(true);
    } else {
      setIsDropdownOpen(false);
    }
  }, [inputValue, updateSearch]);

  const handleVenueSelect = (venue: Venue) => {
    console.log('Venue selected from EnhancedSearchBar:', venue.name);
    setInputValue(venue.name);
    setIsDropdownOpen(false);
    onVenueSelect(venue);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center bg-white rounded-full shadow-md">
        <div className="pl-4 pr-2 text-gray-400">
          <Search size={20} />
        </div>
        <Input 
          ref={inputRef}
          placeholder="Search venues..." 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => inputValue.length > 0 && setIsDropdownOpen(true)}
          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-12 rounded-full"
        />
        {isLoading && (
          <div className="pr-4">
            <Loader2 size={20} className="animate-spin text-gray-400" />
          </div>
        )}
      </div>
      
      {isDropdownOpen && (
        <div 
          ref={dropdownRef} 
          className="absolute left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white rounded-md shadow-lg z-50"
        >
          {venues.length > 0 ? (
            <div className="py-1">
              {venues.map((venue) => (
                <div
                  key={venue.id}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleVenueSelect(venue)}
                >
                  <div className="font-medium">{venue.name}</div>
                  {venue.city && (
                    <div className="text-sm text-gray-500">
                      {venue.city}{venue.country ? `, ${venue.country}` : ''}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : !isLoading && inputValue.length > 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500">
              No venues found matching "{inputValue}"
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default EnhancedSearchBar;
