import React from 'react';
import { Search } from 'lucide-react';
import type { Brewery } from '@/types/brewery';
import { Input } from './ui/input';

interface SidebarProps {
  breweries: Brewery[];
  onBrewerySelect: (brewery: Brewery) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const Sidebar = ({ breweries, onBrewerySelect, searchTerm, onSearchChange }: SidebarProps) => {
  return (
    <div className="w-full h-full bg-card border-r flex flex-col">
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold mb-4">Breweries</h1>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search breweries..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        {breweries.map((brewery) => (
          <button
            key={brewery.id}
            onClick={() => onBrewerySelect(brewery)}
            className="w-full p-4 text-left hover:bg-accent border-b transition-colors"
          >
            <h3 className="font-medium">{brewery.name}</h3>
            <p className="text-sm text-muted-foreground">{brewery.city}, {brewery.state}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;