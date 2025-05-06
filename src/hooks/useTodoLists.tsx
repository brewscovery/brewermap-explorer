
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { TodoList, TodoListVenue } from '@/types/todoList';
import type { Venue } from '@/types/venue';

export const useTodoLists = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isAddingToList, setIsAddingToList] = useState(false);

  // Fetch user's todo lists
  const { 
    data: todoLists = [], 
    isLoading: isLoadingTodoLists,
    error: todoListsError 
  } = useQuery({
    queryKey: ['todoLists', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      console.log("Fetching todo lists for user:", user.id);
      const { data, error } = await supabase
        .from('todo_lists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching todo lists:", error);
        throw error;
      }
      
      console.log("Todo lists fetched:", data);
      return data as TodoList[];
    },
    enabled: !!user
  });
  
  // Fetch venues in todo lists
  const { 
    data: todoListVenues = [],
    isLoading: isLoadingTodoListVenues,
    error: todoListVenuesError
  } = useQuery({
    queryKey: ['todoListVenues', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      console.log("Fetching todo list venues for user:", user.id);
      const { data, error } = await supabase
        .from('todo_list_venues')
        .select(`
          *,
          todo_lists!inner(*),
          venues:venue_id(*)
        `)
        .eq('todo_lists.user_id', user.id);
      
      if (error) {
        console.error("Error fetching todo list venues:", error);
        throw error;
      }
      
      console.log("Todo list venues fetched:", data);
      return data as (TodoListVenue & { venues: Venue, todo_lists: TodoList })[];
    },
    enabled: !!user
  });

  // Create a new todo list
  const createTodoList = useMutation({
    mutationFn: async (name: string) => {
      if (!user) throw new Error('User not authenticated');
      
      console.log("Creating new todo list:", name);
      const { data, error } = await supabase
        .from('todo_lists')
        .insert({ name, user_id: user.id })
        .select()
        .single();
      
      if (error) {
        console.error("Error creating todo list:", error);
        throw error;
      }
      
      console.log("New todo list created:", data);
      return data as TodoList;
    },
    onSuccess: (newList) => {
      queryClient.invalidateQueries({ queryKey: ['todoLists', user?.id] });
      toast.success(`Created new list: ${newList.name}`);
      return newList;
    },
    onError: (error) => {
      toast.error(`Failed to create list: ${error.message}`);
    }
  });

  // Add venue to todo list
  const addVenueToList = useMutation({
    mutationFn: async ({ todoListId, venueId }: { todoListId: string, venueId: string }) => {
      setIsAddingToList(true);
      
      const { data, error } = await supabase
        .from('todo_list_venues')
        .insert({ 
          todo_list_id: todoListId, 
          venue_id: venueId,
          is_completed: false
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todoListVenues', user?.id] });
      toast.success('Venue added to ToDo list');
      setIsAddingToList(false);
    },
    onError: (error) => {
      toast.error(`Failed to add venue: ${error.message}`);
      setIsAddingToList(false);
    }
  });

  // Remove venue from todo list
  const removeVenueFromList = useMutation({
    mutationFn: async (todoListVenueId: string) => {
      const { error } = await supabase
        .from('todo_list_venues')
        .delete()
        .eq('id', todoListVenueId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todoListVenues', user?.id] });
      toast.success('Venue removed from ToDo list');
    },
    onError: (error) => {
      toast.error(`Failed to remove venue: ${error.message}`);
    }
  });

  // Toggle completion status
  const toggleVenueCompletion = useMutation({
    mutationFn: async ({ id, isCompleted }: { id: string, isCompleted: boolean }) => {
      const { error } = await supabase
        .from('todo_list_venues')
        .update({ 
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todoListVenues', user?.id] });
    },
    onError: (error) => {
      toast.error(`Failed to update status: ${error.message}`);
    }
  });

  // Check if venue is in any todo list
  const isVenueInAnyTodoList = useCallback((venueId: string) => {
    return todoListVenues.some(item => item.venue_id === venueId);
  }, [todoListVenues]);

  // Get todo list that contains a venue
  const getTodoListForVenue = useCallback((venueId: string) => {
    const todoVenue = todoListVenues.find(item => item.venue_id === venueId);
    if (!todoVenue) return null;
    
    const todoList = todoLists.find(list => list.id === todoVenue.todo_list_id);
    return todoList || null;
  }, [todoListVenues, todoLists]);

  return {
    todoLists,
    todoListVenues,
    isLoadingTodoLists,
    isLoadingTodoListVenues,
    isAddingToList,
    todoListsError,
    todoListVenuesError,
    createTodoList,
    addVenueToList,
    removeVenueFromList,
    toggleVenueCompletion,
    isVenueInAnyTodoList,
    getTodoListForVenue
  };
};
