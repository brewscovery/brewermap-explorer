
import { useState } from 'react';
import { Search } from 'lucide-react';
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

interface EnhancedSearchBarProps {
  onSearch: (searchTerm: string, searchType: SearchType) => void;
  className?: string;
}

const EnhancedSearchBar = ({ onSearch, className = '' }: EnhancedSearchBarProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('name');

  const handleSearch = () => {
    onSearch(searchTerm, searchType);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={`flex items-center bg-white rounded-full shadow-md ${className}`}>
      <div className="pl-4 pr-2 text-gray-400">
        <Search size={20} />
      </div>
      <Input 
        placeholder="Search breweries..." 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleKeyDown}
        className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-12"
      />
      <Select value={searchType} onValueChange={(value) => setSearchType(value as SearchType)}>
        <SelectTrigger className="w-[120px] border-0 h-12">
          <SelectValue placeholder="Search by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="name">Name</SelectItem>
          <SelectItem value="city">City</SelectItem>
          <SelectItem value="country">Country</SelectItem>
        </SelectContent>
      </Select>
      <Button 
        onClick={handleSearch} 
        variant="ghost" 
        className="rounded-r-full h-12"
      >
        Search
      </Button>
    </div>
  );
};

export default EnhancedSearchBar;
