
import React from "react";
import { format } from "date-fns";
import { Edit, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEventInterest } from '@/hooks/useEventInterest';
import type { EventRowProps } from "./types";

export const EventRow: React.FC<EventRowProps> = ({ 
  event, 
  venueMap, 
  onEdit, 
  onDelete 
}) => {
  const { interestedUsersCount } = useEventInterest(event);

  return (
    <tr className="hover:bg-muted/30">
      <td className="py-1">{event.title}</td>
      <td className="py-1">{venueMap[event.venue_id] || event.venue_id}</td>
      <td className="py-1">{format(new Date(event.start_time), "PPPp")}</td>
      <td className="py-1">{format(new Date(event.end_time), "PPPp")}</td>
      <td className="py-1">{event.is_published ? "Yes" : "No"}</td>
      <td className="py-1">
        <div className="flex items-center gap-1">
          <Users size={14} />
          <Badge variant="outline">
            {interestedUsersCount}
          </Badge>
        </div>
      </td>
      <td className="py-1 flex gap-1">
        <Button
          size="sm"
          variant="ghost"
          onClick={onEdit}
          aria-label="Edit"
        >
          <Edit size={16} />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onDelete}
          aria-label="Delete"
        >
          <Trash2 size={16} />
        </Button>
      </td>
    </tr>
  );
};
