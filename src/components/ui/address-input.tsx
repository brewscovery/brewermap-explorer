
import { useState, useRef, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AddressSuggestion, AddressInputProps } from '@/types/address';
import { cn } from '@/lib/utils';

const AddressInput = ({
  value = '',
  onChange,
  onInputChange,
  placeholder = 'Enter an address',
  required = false,
  disabled = false,
  defaultValue = '',
  className
}: AddressInputProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || defaultValue);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<AddressSuggestion | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync input value with prop value
  useEffect(() => {
    if (value && value !== inputValue) {
      setInputValue(value);
    }
  }, [value]);

  useEffect(() => {
    // Initialize with default value if provided
    if (defaultValue && !inputValue) {
      setInputValue(defaultValue);
    }
  }, [defaultValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    if (onInputChange) {
      onInputChange(newValue);
    }
    
    // If the input is cleared, clear the selected address
    if (!newValue.trim()) {
      setSelectedAddress(null);
      onChange(null);
      setSuggestions([]);
      return;
    }
    
    // Debounce requests to avoid too many API calls
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    setIsLoading(true);
    timeoutRef.current = setTimeout(async () => {
      try {
        if (newValue.length < 3) {
          setSuggestions([]);
          setIsLoading(false);
          return;
        }
        
        const { data, error } = await supabase.functions.invoke('address-suggestions', {
          body: { query: newValue }
        });
        
        if (error) throw error;
        
        setSuggestions(data.suggestions || []);
        
        // Open the popover if we have suggestions
        if (data.suggestions?.length > 0) {
          setIsOpen(true);
        }
      } catch (error) {
        console.error('Error fetching address suggestions:', error);
        toast.error('Failed to get address suggestions');
      } finally {
        setIsLoading(false);
      }
    }, 300);
  };

  const handleSelectAddress = (suggestion: AddressSuggestion) => {
    setSelectedAddress(suggestion);
    setInputValue(suggestion.fullAddress);
    onChange(suggestion);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-full">
          <Input
            value={inputValue}
            onChange={handleInputChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className={cn("pr-10", className)}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MapPin className="h-4 w-4" />
            )}
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]" align="start">
        {suggestions.length > 0 ? (
          <div className="max-h-[300px] overflow-auto">
            {suggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start text-left p-3 rounded-none border-b last:border-0"
                onClick={() => handleSelectAddress(suggestion)}
              >
                <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">{suggestion.fullAddress}</span>
              </Button>
            ))}
          </div>
        ) : (
          <div className="p-3 text-sm text-muted-foreground">
            {isLoading ? 'Loading suggestions...' : 'Type to search for addresses'}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export { AddressInput };
