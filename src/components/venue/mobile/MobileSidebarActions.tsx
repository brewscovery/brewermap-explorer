
import React from 'react';
import { UserCheck, ListTodo, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VenueFollowButton } from '../VenueFollowButton';
import { useTodoLists } from '@/hooks/useTodoLists';
import { useAuth } from '@/contexts/AuthContext';
import type { Venue } from '@/types/venue';

interface MobileSidebarActionsProps {
  venue: Venue;
  displayMode: 'full' | 'favorites';
  onOpenCheckInDialog: () => void;
  onOpenTodoListDialog: () => void;
}

export const MobileSidebarActions = ({ 
  venue, 
  displayMode,
  onOpenCheckInDialog,
  onOpenTodoListDialog 
}: MobileSidebarActionsProps) => {
  const { user, userType } = useAuth();
  const { isVenueInAnyTodoList, getTodoListForVenue } = useTodoLists();

  // Get todo list status for this venue if user is logged in
  const venueInTodoList = user && venue ? isVenueInAnyTodoList(venue.id) : false;
  const todoList = user && venue ? getTodoListForVenue(venue.id) : null;

  return (
    <div className="flex items-center gap-2">
      {user && userType === 'regular' && (
        <>
          {displayMode === 'full' && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={onOpenCheckInDialog}
              className="h-9 px-3"
            >
              <UserCheck size={16} />
              <span className="sr-only">Check In</span>
            </Button>
          )}
          <Button 
            size="sm" 
            variant={venueInTodoList ? "secondary" : "outline"}
            onClick={onOpenTodoListDialog}
            className="h-9 px-3"
            title={venueInTodoList ? `In "${todoList?.name}" list` : "Add to ToDo List"}
          >
            <ListTodo size={16} />
            <span className="sr-only">ToDo List</span>
          </Button>
        </>
      )}
      {venue.id && (
        <Button
          size="sm"
          variant="outline"
          className="h-9 px-3"
          asChild
        >
          <VenueFollowButton venueId={venue.id} />
        </Button>
      )}
    </div>
  );
};
