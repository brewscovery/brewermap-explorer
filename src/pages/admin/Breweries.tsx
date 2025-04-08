
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Search, MapPin, MoreHorizontal, X, ExternalLink } from 'lucide-react';
import { useBreweries, useUpdateBreweryVerification } from '@/hooks/useAdminData';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

const BreweriesManagement = () => {
  const { 
    data: breweries, 
    isLoading, 
    error, 
    searchQuery, 
    setSearchQuery 
  } = useBreweries();
  
  const updateVerification = useUpdateBreweryVerification();
  
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Search is already reactive via the hook
  };
  
  const handleVerificationChange = (breweryId: string, isVerified: boolean) => {
    updateVerification.mutate({ breweryId, isVerified });
  };
  
  const getBreweryTypeBadge = (type: string | null) => {
    if (!type) return null;
    
    const types: Record<string, { label: string, className: string }> = {
      micro: { 
        label: 'Micro', 
        className: 'bg-blue-100 text-blue-800 border-blue-300' 
      },
      regional: { 
        label: 'Regional', 
        className: 'bg-green-100 text-green-800 border-green-300' 
      },
      brewpub: { 
        label: 'Brewpub', 
        className: 'bg-amber-100 text-amber-800 border-amber-300' 
      },
      large: { 
        label: 'Large', 
        className: 'bg-purple-100 text-purple-800 border-purple-300' 
      },
      contract: { 
        label: 'Contract', 
        className: 'bg-indigo-100 text-indigo-800 border-indigo-300' 
      },
      proprietor: { 
        label: 'Proprietor', 
        className: 'bg-pink-100 text-pink-800 border-pink-300' 
      }
    };
    
    const breweryType = types[type.toLowerCase()] || {
      label: type, 
      className: 'bg-gray-100 text-gray-800 border-gray-300'
    };
    
    return (
      <Badge variant="outline" className={breweryType.className}>
        {breweryType.label}
      </Badge>
    );
  };
  
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Breweries Management</h1>
        </div>
        <div className="p-4 border rounded-md bg-red-50 text-red-800">
          Error loading breweries: {error.message}
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Breweries Management</h1>
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
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Venues</TableHead>
              <TableHead>Verified</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-10" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-9 w-10" /></TableCell>
                </TableRow>
              ))
            ) : breweries && breweries.length > 0 ? (
              breweries.map((brewery) => (
                <TableRow key={brewery.id}>
                  <TableCell className="font-medium">{brewery.name}</TableCell>
                  <TableCell>{getBreweryTypeBadge(brewery.brewery_type)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{brewery.venues?.count || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {brewery.is_verified ? (
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                        <CheckCircle className="mr-1 h-3 w-3" /> Verified
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
                        <X className="mr-1 h-3 w-3" /> Unverified
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {brewery.owners && brewery.owners.length > 0 
                      ? brewery.owners.map(owner => 
                          owner.user ? `${owner.user.first_name || ''} ${owner.user.last_name || ''}`.trim() : 'Unknown'
                        ).join(', ')
                      : 'No owner'}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleVerificationChange(brewery.id, !brewery.is_verified)}
                        >
                          {brewery.is_verified ? (
                            <>
                              <X className="mr-2 h-4 w-4" />
                              Mark as Unverified
                            </>
                          ) : (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Mark as Verified
                            </>
                          )}
                        </DropdownMenuItem>
                        {brewery.website_url && (
                          <DropdownMenuItem>
                            <a 
                              href={brewery.website_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center w-full"
                            >
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Visit Website
                            </a>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  {searchQuery ? 'No breweries found matching your search.' : 'No breweries found.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default BreweriesManagement;
