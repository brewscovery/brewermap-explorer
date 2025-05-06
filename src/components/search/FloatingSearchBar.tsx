
import React from 'react';
import EnhancedSearchBar from './EnhancedSearchBar';
import { cn } from '@/lib/utils';

interface FloatingSearchBarProps {
  onVenueSelect: (venue: any) => void;
  className?: string;
}

const FloatingSearchBar: React.FC<FloatingSearchBarProps> = ({ 
  onVenueSelect,
  className 
}) => {
  const handleVenueSelect = (venue) => {
    console.log('FloatingSearchBar: onVenueSelect called with venue:', venue?.name || 'none');
    onVenueSelect(venue);
  };

  return (
    <div className={cn(
      "fixed z-[100] top-4 left-20 w-[320px] md:w-[400px] lg:w-[520px]",
      "animate-fade-in duration-300",
      className
    )}>
      <EnhancedSearchBar 
        onVenueSelect={handleVenueSelect}
        className="w-full shadow-lg"
      />
    </div>
  );
};

export default FloatingSearchBar;
