
import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Input } from '@/components/ui/input';
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
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [selectedAddress, setSelectedAddress] = useState<AddressSuggestion | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync input value with prop value
  useEffect(() => {
    if (value && value !== inputValue) {
      setInputValue(value);
    }
  }, [value]);

  // Initialize with default value if provided
  useEffect(() => {
    if (defaultValue && !inputValue) {
      setInputValue(defaultValue);
    }
  }, [defaultValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setSelectedIndex(-1);
    
    if (onInputChange) {
      onInputChange(newValue);
    }
    
    // If the input is cleared, clear everything
    if (!newValue.trim()) {
      setSelectedAddress(null);
      onChange(null);
      setSuggestions([]);
      return;
    }
    
    // Debounce requests
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
    
    // Ensure we call onChange with the full suggestion object
    console.log('Selected address:', suggestion);
    onChange(suggestion);
    
    setIsOpen(false);
    setSuggestions([]);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!suggestions.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSelectAddress(suggestions[selectedIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative w-full">
      <Input
        ref={inputRef}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={cn("pr-10", className)}
        onFocus={() => {
          if (suggestions.length > 0) {
            setIsOpen(true);
          }
        }}
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <MapPin className="h-4 w-4" />
        )}
      </div>

      {suggestions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-0 shadow-md">
          <div className="max-h-[300px] overflow-auto">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-center p-3 cursor-pointer transition-colors",
                  selectedIndex === index ? "bg-accent text-accent-foreground" : "",
                  selectedAddress?.fullAddress === suggestion.fullAddress ? "bg-primary/10 font-medium" : "",
                  "hover:bg-accent hover:text-accent-foreground"
                )}
                onClick={() => handleSelectAddress(suggestion)}
              >
                <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">{suggestion.fullAddress}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export { AddressInput };
