
import React from 'react';
import { FixedSizeList as List } from 'react-window';

interface Brewery {
  id: string;
  name: string;
  is_verified: boolean;
  has_owner: boolean;
  country?: string | null;
}

interface VirtualBreweryListProps {
  breweries: Brewery[];
  onBrewerySelect: (brewery: Brewery) => void;
  selectedBreweryId?: string | null;
}

interface BreweryItemProps {
  index: number;
  style: React.CSSProperties;
  data: {
    breweries: Brewery[];
    onBrewerySelect: (brewery: Brewery) => void;
    selectedBreweryId?: string | null;
  };
}

const BreweryItem = ({ index, style, data }: BreweryItemProps) => {
  const { breweries, onBrewerySelect, selectedBreweryId } = data;
  const brewery = breweries[index];

  return (
    <div
      style={style}
      className={`p-3 hover:bg-muted cursor-pointer transition-colors border-b border-border/50 ${
        selectedBreweryId === brewery.id ? 'bg-muted' : ''
      }`}
      onClick={() => onBrewerySelect(brewery)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onBrewerySelect(brewery);
        }
      }}
    >
      <div className="flex flex-col">
        <span className="font-medium">{brewery.name}</span>
        {brewery.country && (
          <span className="text-sm text-muted-foreground">
            {brewery.country}
          </span>
        )}
      </div>
    </div>
  );
};

const VirtualBreweryList = ({ 
  breweries, 
  onBrewerySelect, 
  selectedBreweryId 
}: VirtualBreweryListProps) => {
  if (breweries.length === 0) {
    return null;
  }

  const itemData = {
    breweries,
    onBrewerySelect,
    selectedBreweryId
  };

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50 max-h-60 overflow-hidden">
      <List
        height={Math.min(breweries.length * 64, 240)} // Max height of 240px (items are 64px each now)
        itemCount={breweries.length}
        itemSize={64}
        itemData={itemData}
        width="100%"
      >
        {BreweryItem}
      </List>
    </div>
  );
};

export default VirtualBreweryList;
