
import React from 'react';
import { Brewery } from '@/types/brewery';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ChevronDown, PlusCircle } from 'lucide-react';
import { getBreweryInitials } from './utils';

interface BrewerySelectorProps {
  selectedBrewery: Brewery | null;
  breweries: Brewery[];
  onBrewerySelect: (brewery: Brewery) => void;
  onAddBrewery: () => void;
}

export const BrewerySelector = ({
  selectedBrewery,
  breweries,
  onBrewerySelect,
  onAddBrewery
}: BrewerySelectorProps) => {
  if (!selectedBrewery && breweries.length > 0) {
    return (
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between text-sm">
            <span>Select a brewery</span>
            <ChevronDown size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56 z-[120]" side="bottom" sideOffset={4}>
          <BrewerySelectorItems 
            breweries={breweries}
            selectedBreweryId={null}
            onBrewerySelect={onBrewerySelect}
            onAddBrewery={onAddBrewery}
          />
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-full justify-between h-auto p-0 hover:bg-transparent">
          <div className="flex items-center space-x-3">
            <Avatar>
              {selectedBrewery?.logo_url ? (
                <AvatarImage 
                  src={selectedBrewery.logo_url} 
                  alt={`${selectedBrewery.name} logo`} 
                />
              ) : null}
              <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                {getBreweryInitials(selectedBrewery?.name || "")}
              </AvatarFallback>
            </Avatar>
            
            <div className="overflow-hidden text-ellipsis text-left">
              <h3 className="font-medium text-sm truncate">
                {selectedBrewery?.name}
              </h3>
            </div>
          </div>
          <ChevronDown size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56 z-[120]" side="bottom" sideOffset={4}>
        <BrewerySelectorItems 
          breweries={breweries}
          selectedBreweryId={selectedBrewery?.id}
          onBrewerySelect={onBrewerySelect}
          onAddBrewery={onAddBrewery}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

interface BrewerySelectorItemsProps {
  breweries: Brewery[];
  selectedBreweryId: string | null;
  onBrewerySelect: (brewery: Brewery) => void;
  onAddBrewery: () => void;
}

const BrewerySelectorItems = ({
  breweries,
  selectedBreweryId,
  onBrewerySelect,
  onAddBrewery
}: BrewerySelectorItemsProps) => {
  return (
    <>
      {breweries.map((brewery) => (
        <DropdownMenuItem 
          key={brewery.id}
          onClick={() => onBrewerySelect(brewery)}
          className={selectedBreweryId === brewery.id ? "bg-accent text-accent-foreground" : ""}
        >
          <div className="flex items-center w-full">
            <Avatar className="h-6 w-6 mr-2">
              {brewery.logo_url ? (
                <AvatarImage src={brewery.logo_url} alt={brewery.name} />
              ) : null}
              <AvatarFallback className="text-xs">
                {getBreweryInitials(brewery.name)}
              </AvatarFallback>
            </Avatar>
            <span className="truncate">{brewery.name}</span>
          </div>
        </DropdownMenuItem>
      ))}
      <DropdownMenuItem onClick={onAddBrewery}>
        <PlusCircle size={16} className="mr-2" />
        Add Brewery
      </DropdownMenuItem>
    </>
  );
};
