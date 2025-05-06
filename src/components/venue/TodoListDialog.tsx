import React, { useState } from 'react';
import { useTodoLists } from '@/hooks/useTodoLists';
import { useAuth } from '@/contexts/AuthContext';
import { ListTodo, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Venue } from '@/types/venue';
import { Separator } from '@/components/ui/separator';

interface TodoListDialogProps {
  venue: Venue;
  isOpen: boolean;
  onClose: () => void;
}

export function TodoListDialog({ venue, isOpen, onClose }: TodoListDialogProps) {
  const { user } = useAuth();
  const {
    todoLists,
    isLoadingTodoLists,
    isAddingToList,
    createTodoList,
    addVenueToList,
    isVenueInAnyTodoList,
    isVenueInAnyTodoListNotCompleted,
    getTodoListForVenue
  } = useTodoLists();
  
  const [selectedListId, setSelectedListId] = useState<string>('');
  const [newListName, setNewListName] = useState<string>('');
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  
  const venueInList = user ? getTodoListForVenue(venue.id) : null;
  const alreadyInTodoList = user ? isVenueInAnyTodoList(venue.id) : false;
  const alreadyInTodoListAndNotCompleted = user ? isVenueInAnyTodoListNotCompleted(venue.id) : false;

  const handleAddToList = async () => {
    if (isCreatingNew && newListName.trim()) {
      try {
        // Create new list then add venue to it
        const newList = await createTodoList.mutateAsync(newListName.trim());
        if (newList) {
          await addVenueToList.mutateAsync({
            todoListId: newList.id,
            venueId: venue.id
          });
        }
      } catch (error) {
        console.error('Error creating new list:', error);
      }
    } else if (selectedListId) {
      // Add to existing list
      await addVenueToList.mutateAsync({
        todoListId: selectedListId,
        venueId: venue.id
      });
    }
    
    // Reset form state
    setNewListName('');
    setSelectedListId('');
    setIsCreatingNew(false);
    onClose();
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add to ToDo List</DialogTitle>
          <DialogDescription>
            {alreadyInTodoList 
              ? `This venue is already in your "${venueInList?.name}" list.`
              : `Add ${venue.name} to your ToDo list`}
          </DialogDescription>
        </DialogHeader>
        
        {!alreadyInTodoList && (
          <div className="space-y-4">
            {todoLists.length > 0 && (
              <div className="space-y-3">
                <Label>Select an existing list</Label>
                <RadioGroup value={selectedListId} onValueChange={setSelectedListId}>
                  {todoLists.map((list) => (
                    <div key={list.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={list.id} id={`list-${list.id}`} />
                      <Label htmlFor={`list-${list.id}`}>{list.name}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}
            
            {todoLists.length > 0 && <Separator className="my-4" />}
            
            <div className="space-y-3">
              <Label>Create a new list</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="New list name"
                  value={newListName}
                  onChange={(e) => {
                    setNewListName(e.target.value);
                    if (e.target.value.trim()) {
                      setIsCreatingNew(true);
                      setSelectedListId('');
                    } else {
                      setIsCreatingNew(false);
                    }
                  }}
                />
              </div>
            </div>
          </div>
        )}
        
        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {!alreadyInTodoList && (
            <Button 
              onClick={handleAddToList} 
              disabled={isAddingToList || (!selectedListId && !newListName.trim())}
            >
              {isAddingToList ? "Adding..." : "Add to List"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
