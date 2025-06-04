
import React from 'react';
import { CheckInDialog } from '@/components/CheckInDialog';
import { TodoListDialog } from '../TodoListDialog';
import type { Venue } from '@/types/venue';
import type { User } from '@supabase/supabase-js';

interface MobileSidebarDialogsProps {
  venue: Venue;
  user: User | null;
  isCheckInDialogOpen: boolean;
  isTodoListDialogOpen: boolean;
  onCheckInDialogClose: () => void;
  onTodoListDialogClose: () => void;
  onCheckInSuccess: () => void;
}

export const MobileSidebarDialogs = ({
  venue,
  user,
  isCheckInDialogOpen,
  isTodoListDialogOpen,
  onCheckInDialogClose,
  onTodoListDialogClose,
  onCheckInSuccess
}: MobileSidebarDialogsProps) => {
  if (!venue || !user) return null;
  
  // Add logging to track dialog state
  console.log('Mobile dialogs rendering with states:', { isCheckInDialogOpen, isTodoListDialogOpen });
  
  const handleCheckInClose = () => {
    console.log('Check-in dialog close triggered');
    onCheckInDialogClose();
  };
  
  const handleTodoListClose = () => {
    console.log('Todo list dialog close triggered');
    onTodoListDialogClose();
  };
  
  return (
    <div className="z-[200] pointer-events-auto">
      {/* Using dialog-fixed version for better stacking and z-index handling */}
      <CheckInDialog
        venue={venue}
        isOpen={isCheckInDialogOpen}
        onClose={handleCheckInClose}
        onSuccess={onCheckInSuccess}
      />
      <TodoListDialog
        venue={venue}
        isOpen={isTodoListDialogOpen}
        onClose={handleTodoListClose}
      />
    </div>
  );
};
