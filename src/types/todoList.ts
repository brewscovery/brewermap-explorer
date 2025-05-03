
export interface TodoList {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface TodoListVenue {
  id: string;
  todo_list_id: string;
  venue_id: string;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}
