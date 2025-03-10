
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

type SearchType = 'name' | 'city' | 'country';

interface SearchBarProps {
  onSearch: (searchTerm: string, searchType: SearchType) => void;
}

const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('name');

  const handleSearch = () => {
    onSearch(searchTerm, searchType);
  };

  return (
    <div className="absolute top-[80px] left-4 z-10 bg-white p-3 rounded-md shadow-md w-80">
      <div className="flex gap-2 mb-2">
        <Input 
          placeholder="Search breweries..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button onClick={handleSearch}>Search</Button>
      </div>
      <Select value={searchType} onValueChange={(value) => setSearchType(value as SearchType)}>
        <SelectTrigger>
          <SelectValue placeholder="Search by..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="name">Name</SelectItem>
          <SelectItem value="city">City</SelectItem>
          <SelectItem value="country">Country</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default SearchBar;
