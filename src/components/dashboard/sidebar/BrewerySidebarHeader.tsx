
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  SidebarHeader
} from '@/components/ui/sidebar';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Brewery } from '@/types/brewery';
import { 
  ChevronDown, 
  PlusCircle 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface BrewerySidebarHeaderProps {
  selectedBrewery: Brewery | null;
  breweries: Brewery[];
  isLoading: boolean;
  onBrewerySelect: (brewery: Brewery) => void;
}

export const BrewerySidebarHeader = ({ 
  selectedBrewery, 
  breweries,
  isLoading,
  onBrewerySelect
}: BrewerySidebarHeaderProps) => {
  const navigate = useNavigate();
  
  // Create initials from brewery name for fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Handle adding a new brewery
  const handleAddBrewery = () => {
    navigate('/dashboard/breweries');
  };
  
  // Loading state
  if (isLoading) {
    return (
      <SidebarHeader className="flex flex-col items-center p-4">
        <div className="w-full flex items-center space-x-3">
          <div className="animate-pulse h-10 w-10 bg-muted rounded-full"></div>
          <div className="animate-pulse h-4 w-32 bg-muted rounded"></div>
        </div>
      </SidebarHeader>
    );
  }
  
  // No breweries available
  if (breweries.length === 0) {
    return (
      <SidebarHeader className="p-4">
        <Button 
          variant="outline" 
          onClick={handleAddBrewery}
          className="w-full justify-start text-sm"
        >
          <PlusCircle size={16} className="mr-2" />
          Add Brewery
        </Button>
      </SidebarHeader>
    );
  }
  
  // No brewery selected but breweries are available
  if (!selectedBrewery && breweries.length > 0) {
    return (
      <SidebarHeader className="p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between text-sm">
              <span>Select a brewery</span>
              <ChevronDown size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {breweries.map((brewery) => (
              <DropdownMenuItem 
                key={brewery.id}
                onClick={() => onBrewerySelect(brewery)}
              >
                <div className="flex items-center w-full">
                  <Avatar className="h-6 w-6 mr-2">
                    {brewery.logo_url ? (
                      <AvatarImage src={brewery.logo_url} alt={brewery.name} />
                    ) : null}
                    <AvatarFallback className="text-xs">
                      {getInitials(brewery.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate">{brewery.name}</span>
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem onClick={handleAddBrewery}>
              <PlusCircle size={16} className="mr-2" />
              Add Brewery
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarHeader>
    );
  }
  
  // Brewery is selected, show dropdown selector
  return (
    <SidebarHeader className="flex flex-col items-center p-4">
      <DropdownMenu>
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
                  {getInitials(selectedBrewery?.name || "")}
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
        <DropdownMenuContent align="start" className="w-56">
          {breweries.map((brewery) => (
            <DropdownMenuItem 
              key={brewery.id}
              onClick={() => onBrewerySelect(brewery)}
              className={selectedBrewery?.id === brewery.id ? "bg-accent text-accent-foreground" : ""}
            >
              <div className="flex items-center w-full">
                <Avatar className="h-6 w-6 mr-2">
                  {brewery.logo_url ? (
                    <AvatarImage src={brewery.logo_url} alt={brewery.name} />
                  ) : null}
                  <AvatarFallback className="text-xs">
                    {getInitials(brewery.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate">{brewery.name}</span>
              </div>
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem onClick={handleAddBrewery}>
            <PlusCircle size={16} className="mr-2" />
            Add Brewery
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarHeader>
  );
};
