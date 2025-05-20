
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
    <div className="flex items-center gap-2">
      {user && userType === 'regular' && (
        <>
          {displayMode === 'full' && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={onOpenCheckInDialog}
              className="h-9 px-3 transition-all active:scale-95"
              title="Check In"
            >
              <UserCheck size={18} />
              <span className="sr-only">Check In</span>
            </Button>
          )}
          <Button 
            size="sm" 
            variant={venueInTodoList ? "default" : "outline"}
            onClick={onOpenTodoListDialog}
            className="h-9 px-3 transition-all active:scale-95"
            title={venueInTodoList ? `In "${todoList?.name}" list` : "Add to ToDo List"}
          >
            <ListTodo size={18} className={venueInTodoList ? "fill-current" : ""} />
            <span className="sr-only">Todo</span>
          </Button>
        </>
      )}
      {venue.id && (
        <VenueFollowButton 
          venueId={venue.id} 
          showCount={false}
        />
      )}
    </div>
  );
};
