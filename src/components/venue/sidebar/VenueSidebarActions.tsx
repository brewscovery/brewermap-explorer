
import React from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const { user, userType } = useAuth();
  const { isVenueInAnyTodoList, getTodoListForVenue } = useTodoLists();

  // Get todo list status for this venue if user is logged in
  const venueInTodoList = user && venue ? isVenueInAnyTodoList(venue.id) : false;
  const todoList = user && venue ? getTodoListForVenue(venue.id) : null;
  
  // Redirect unauthenticated users to login page
  const handleUnauthenticatedAction = () => {
    navigate('/auth');
  };

  // Show buttons for all users except business users
  const shouldShowButtons = userType !== 'business';

  if (!shouldShowButtons) return null;

  // For authenticated users (regular or admin), use the normal behavior
  // For unauthenticated users, redirect to login
  const handleCheckInClick = user ? onOpenCheckInDialog : handleUnauthenticatedAction;
  const handleTodoListClick = user ? onOpenTodoListDialog : handleUnauthenticatedAction;

  return (
    <div className="flex items-center gap-3">
      {displayMode === 'full' && (
        <Button 
          size="default" 
          variant="outline"
          onClick={handleCheckInClick}
          className="h-10 px-4 transition-all hover:scale-105"
          title="Check In"
        >
          <UserCheck size={20} />
        </Button>
      )}
      <Button 
        size="default" 
        variant={venueInTodoList ? "default" : "outline"}
        onClick={handleTodoListClick}
        className="h-10 px-4 transition-all hover:scale-105"
        title={venueInTodoList ? `In "${todoList?.name}" list` : "Add to ToDo List"}
      >
        <ListTodo size={20} className={venueInTodoList ? "fill-current" : ""} />
      </Button>
      
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
