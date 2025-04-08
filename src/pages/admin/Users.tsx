
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
import { Search, MoreHorizontal, Edit } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useUsers, useUpdateUserType } from '@/hooks/useAdminData';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';

const getUserTypeBadge = (userType: string) => {
  switch (userType) {
    case 'admin':
      return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 border-purple-300">Admin</Badge>;
    case 'business':
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-300">Business</Badge>;
    case 'regular':
    default:
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-300">Regular</Badge>;
  }
};

const UsersManagement = () => {
  const { 
    data: users, 
    isLoading, 
    error, 
    searchQuery, 
    setSearchQuery
  } = useUsers();
  
  const updateUserType = useUpdateUserType();
  
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Search is already reactive via the hook
  };
  
  const handleUserTypeChange = (userId: string, newType: 'admin' | 'business' | 'regular') => {
    updateUserType.mutate({ userId, userType: newType });
  };
  
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Users Management</h1>
        </div>
        <div className="p-4 border rounded-md bg-red-50 text-red-800">
          Error loading users: {error.message}
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Users Management</h1>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search users..."
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
              <TableHead>Email</TableHead>
              <TableHead>User Type</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-9 w-10" /></TableCell>
                </TableRow>
              ))
            ) : users && users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.first_name && user.last_name 
                      ? `${user.first_name} ${user.last_name}` 
                      : 'Unnamed User'}
                  </TableCell>
                  <TableCell>{user.email || 'No email available'}</TableCell>
                  <TableCell>{getUserTypeBadge(user.user_type)}</TableCell>
                  <TableCell>{format(new Date(user.created_at), 'MMM d, yyyy')}</TableCell>
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
                          onClick={() => handleUserTypeChange(user.id, 'admin')}
                          disabled={user.user_type === 'admin'}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Set as Admin
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleUserTypeChange(user.id, 'business')}
                          disabled={user.user_type === 'business'}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Set as Business
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleUserTypeChange(user.id, 'regular')}
                          disabled={user.user_type === 'regular'}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Set as Regular
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  {searchQuery ? 'No users found matching your search.' : 'No users found.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default UsersManagement;
