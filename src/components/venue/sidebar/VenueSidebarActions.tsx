
import React from 'react';
import { UserCheck, ListTodo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VenueFollowButton } from '../VenueFollowButton';
import { useTodoLists } from '@/hooks/useTodoLists';
import { useAuth } from '@/contexts/AuthContext';
import type { Venue } from '@/types/venue';

interface VenueSidebarActionsProps {
  venue: Venue;
  displayMode: 'full' | 'favorites';
  onOpenCheckInDialog: () => void;
  onOpenTodoListDialog: () => void;
}

const VenueSidebarActions = ({ 
  venue, 
  displayMode,
  onOpenCheckInDialog,
  onOpenTodoListDialog 
}: VenueSidebarActionsProps) => {
  const { user, userType } = useAuth();
  const { isVenueInAnyTodoList, getTodoListForVenue } = useTodoLists();

  // Get todo list status for this venue if user is logged in
  const venueInTodoList = user && venue ? isVenueInAnyTodoList(venue.id) : false;
  const todoList = user && venue ? getTodoListForVenue(venue.id) : null;

  return (
    <div className="flex items-center gap-3">
      {user && userType === 'regular' && (
        <>
          {displayMode === 'full' && (
            <Button 
              size="default" 
              variant="outline"
              onClick={onOpenCheckInDialog}
              className="h-10 px-4 transition-all hover:scale-105"
              title="Check In"
            >
              <UserCheck size={20} />
              <span className="sr-only md:not-sr-only md:ml-2">Check In</span>
            </Button>
          )}
          <Button 
            size="default" 
            variant={venueInTodoList ? "default" : "outline"}
            onClick={onOpenTodoListDialog}
            className="h-10 px-4 transition-all hover:scale-105"
            title={venueInTodoList ? `In "${todoList?.name}" list` : "Add to ToDo List"}
          >
            <ListTodo size={20} className={venueInTodoList ? "fill-current" : ""} />
            <span className="sr-only md:not-sr-only md:ml-2">Todo</span>
          </Button>
        </>
      )}
      {venue.id && (
        <VenueFollowButton 
          venueId={venue.id} 
          showCount={false}
          size="default"
        />
      )}
    </div>
  );
};

export default VenueSidebarActions;
