
import React, { useState } from 'react';
import { useTodoLists } from '@/hooks/useTodoLists';
import { useAuth } from '@/contexts/AuthContext';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ListTodo, Plus, Trash2, Check } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

const TodoListsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [newListName, setNewListName] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [listToDelete, setListToDelete] = useState<string | null>(null);
  
  console.log("TodoListsPage rendering, user:", user);
  
  const {
    todoLists,
    todoListVenues,
    isLoadingTodoLists,
    isLoadingTodoListVenues,
    createTodoList,
    toggleVenueCompletion
  } = useTodoLists();
  
  console.log("todoLists:", todoLists);
  console.log("todoListVenues:", todoListVenues);
  console.log("isLoadingTodoLists:", isLoadingTodoLists);

  const handleAddList = async () => {
    if (newListName.trim()) {
      await createTodoList.mutateAsync(newListName.trim());
      setNewListName('');
    }
  };

  const handleToggleCompletion = (id: string, isCompleted: boolean) => {
    toggleVenueCompletion.mutate({ id, isCompleted: !isCompleted });
  };

  const handleDeleteList = async (listId: string) => {
    try {
      const { error } = await supabase
        .from('todo_lists')
        .delete()
        .eq('id', listId);
        
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['todoLists', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['todoListVenues', user?.id] });
      toast.success('List deleted successfully');
      setListToDelete(null);
    } catch (error: any) {
      console.error('Error deleting list:', error);
      toast.error(`Failed to delete list: ${error.message}`);
    }
  };

  const confirmDeleteList = (listId: string) => {
    setListToDelete(listId);
    setIsDeleteDialogOpen(true);
  };

  const handleViewVenue = (venueId: string) => {
    navigate(`/?venueId=${venueId}`);
  };

  if (!user) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold">Please login to view your ToDo lists</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Your ToDo Lists</h1>
      </div>
      
      <div className="mb-8">
        <div className="flex gap-2 items-center">
          <Input
            placeholder="New list name"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            className="max-w-xs"
          />
          <Button 
            onClick={handleAddList} 
            disabled={!newListName.trim()}
            size="sm"
          >
            <Plus size={16} className="mr-1" />
            Add List
          </Button>
        </div>
      </div>
      
      {isLoadingTodoLists ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, index) => (
            <Card key={index} className="shadow-md">
              <CardHeader>
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : todoLists.length === 0 ? (
        <div className="text-center py-16 border rounded-lg">
          <ListTodo className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No ToDo Lists Yet</h3>
          <p className="text-sm text-muted-foreground">
            Create your first list to start tracking venues you want to visit
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {todoLists.map((list) => {
            const venuesInList = todoListVenues.filter(
              item => item.todo_list_id === list.id
            );
            
            const completedCount = venuesInList.filter(item => item.is_completed).length;
            const totalCount = venuesInList.length;
            
            return (
              <Card key={list.id} className="shadow-md">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>{list.name}</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => confirmDeleteList(list.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                  <CardDescription>
                    {completedCount} of {totalCount} completed
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {isLoadingTodoListVenues ? (
                    <div className="space-y-2">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-6 w-full" />
                      ))}
                    </div>
                  ) : venuesInList.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">
                      No venues in this list yet
                    </p>
                  ) : (
                    venuesInList.map((item) => (
                      <div 
                        key={item.id} 
                        className="flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <Checkbox 
                            id={item.id} 
                            checked={item.is_completed}
                            onCheckedChange={() => handleToggleCompletion(item.id, item.is_completed)}
                          />
                          <div 
                            className={`flex-1 cursor-pointer ${item.is_completed ? "line-through text-muted-foreground" : ""}`}
                            onClick={() => handleViewVenue(item.venue_id)}
                          >
                            <span className="text-sm">{item.venues.name}</span>
                            {item.is_completed && item.completed_at && (
                              <div className="text-xs text-muted-foreground">
                                Completed {formatDistanceToNow(new Date(item.completed_at), { addSuffix: true })}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleViewVenue(item.venue_id)}
                          >
                            <Check size={14} />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
                <CardFooter>
                  <p className="text-xs text-muted-foreground">
                    Created {formatDistanceToNow(new Date(list.created_at), { addSuffix: true })}
                  </p>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
      
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete ToDo List</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this list? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setListToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (listToDelete) {
                  handleDeleteList(listToDelete);
                }
                setIsDeleteDialogOpen(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TodoListsPage;
