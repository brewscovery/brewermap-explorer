
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
  
  return (
    <>
      {/* Using dialog-fixed version for better stacking and z-index handling */}
      <CheckInDialog
        venue={venue}
        isOpen={isCheckInDialogOpen}
        onClose={onCheckInDialogClose}
        onSuccess={onCheckInSuccess}
      />
      <TodoListDialog
        venue={venue}
        isOpen={isTodoListDialogOpen}
        onClose={onTodoListDialogClose}
      />
    </>
  );
};
