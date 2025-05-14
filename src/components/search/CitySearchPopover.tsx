
import React, { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Loader2, MapPin, X } from 'lucide-react';
import { 
  Popover, 
  PopoverTrigger, 
  PopoverContent 
} from '@/components/ui/popover';
import { 
  Command, 
  CommandEmpty, 
  CommandGroup, 
  CommandItem, 
  CommandList 
} from '@/components/ui/command';
import { useCitySearch, CityResult } from '@/hooks/useCitySearch';

interface CitySearchPopoverProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onCitySelect: (city: string) => void;
  onSearch: () => void;
  className?: string;
}

const CitySearchPopover = ({
  searchTerm,
  onSearchChange,
  onCitySelect,
  onSearch,
  className = ''
}: CitySearchPopoverProps) => {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { cities, isLoading } = useCitySearch(searchTerm);

  // Handle input change for city search
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onSearchChange(value);
    
    // Only open dropdown if there's text in the input
    if (value.length > 1) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  };
  
  // Handle clearing the search
  const handleClearSearch = () => {
    onSearchChange('');
    setOpen(false);
  };
  
  // Handle city selection
  const handleSelect = (city: string) => {
    setOpen(false);
    onCitySelect(city);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className={`relative ${className}`}>
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            <MapPin size={18} />
          </div>
          <Input
            ref={inputRef}
            placeholder="Search events by city"
            value={searchTerm}
            onChange={handleInputChange}
            className="pl-10 pr-10"
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
          />
          {searchTerm && (
            <button 
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[300px]" align="start">
        <Command>
          <CommandList>
            {isLoading && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <p className="text-sm text-muted-foreground">Searching cities...</p>
              </div>
            )}
            <CommandEmpty>No cities found</CommandEmpty>
            <CommandGroup>
              {cities.map((city, index) => (
                <CommandItem 
                  key={index} 
                  value={city.city}
                  onSelect={() => handleSelect(city.city)}
                  className="cursor-pointer"
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  <div className="flex flex-col">
                    <span>{city.city}</span>
                    <span className="text-xs text-muted-foreground">
                      {[city.state, city.country].filter(Boolean).join(", ")}
                      {city.count > 0 && ` • ${city.count} venue${city.count !== 1 ? 's' : ''}`}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default CitySearchPopover;
