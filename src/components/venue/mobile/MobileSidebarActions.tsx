
import React from 'react';
import { UserCheck, ListTodo } from 'lucide-react';
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
    <>
      {user && userType === 'regular' && (
        <>
          {displayMode === 'full' && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={onOpenCheckInDialog}
              className="flex items-center gap-1"
            >
              <UserCheck size={16} />
              <span>Check In</span>
            </Button>
          )}
          <Button 
            size="sm" 
            variant={venueInTodoList ? "secondary" : "outline"}
            onClick={onOpenTodoListDialog}
            className="flex items-center gap-1"
            title={venueInTodoList ? `In "${todoList?.name}" list` : "Add to ToDo List"}
          >
            <ListTodo size={16} />
          </Button>
        </>
      )}
      {venue.id && <VenueFollowButton venueId={venue.id} />}
    </>
  );
};
