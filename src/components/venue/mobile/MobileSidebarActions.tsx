
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
    <div className="flex items-center gap-3">
      {user && userType === 'regular' && (
        <>
          {displayMode === 'full' && (
            <Button 
              size="default" 
              variant="outline"
              onClick={onOpenCheckInDialog}
              className="h-10 px-4 transition-all active:scale-95"
              title="Check In"
            >
              <UserCheck size={20} />
            </Button>
          )}
          <Button 
            size="default" 
            variant={venueInTodoList ? "default" : "outline"}
            onClick={onOpenTodoListDialog}
            className="h-10 px-4 transition-all active:scale-95"
            title={venueInTodoList ? `In "${todoList?.name}" list` : "Add to ToDo List"}
          >
            <ListTodo size={20} className={venueInTodoList ? "fill-current" : ""} />
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
