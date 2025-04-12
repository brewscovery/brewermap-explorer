
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';

interface BreweriesSearchFormProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearch: (e: React.FormEvent<HTMLFormElement>) => void;
  onAddBrewery: () => void;
}

const BreweriesSearchForm = ({
  searchQuery,
  setSearchQuery,
  handleSearch,
  onAddBrewery
}: BreweriesSearchFormProps) => {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold">Breweries Management</h1>
      <div className="flex gap-2">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search breweries..."
              className="pl-8 w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button type="submit" variant="outline" size="sm">Search</Button>
        </form>
        <Button onClick={onAddBrewery}>
          <Plus className="h-4 w-4 mr-2" />
          Add Brewery
        </Button>
      </div>
    </div>
  );
};

export default BreweriesSearchForm;
