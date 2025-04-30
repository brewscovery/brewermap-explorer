
import React from "react";
import { TableHeader } from "./TableHeader";

interface EventsTableHeaderProps {
  sortField: string;
  sortDirection: 'asc' | 'desc';
  toggleSort: (field: string) => void;
}

export const EventsTableHeader: React.FC<EventsTableHeaderProps> = ({
  sortField,
  sortDirection,
  toggleSort,
}) => {
  return (
    <thead>
      <tr className="text-left">
        <TableHeader
          label="Title"
          sortField="title"
          currentSort={sortField}
          sortDirection={sortDirection}
          onSort={() => toggleSort('title')}
        />
        <TableHeader
          label="Venue"
          sortField="venue_id"
          currentSort={sortField}
          sortDirection={sortDirection}
          onSort={() => toggleSort('venue_id')}
        />
        <TableHeader
          label="Start"
          sortField="start_time"
          currentSort={sortField}
          sortDirection={sortDirection}
          onSort={() => toggleSort('start_time')}
        />
        <TableHeader
          label="End"
          sortField="end_time"
          currentSort={sortField}
          sortDirection={sortDirection}
          onSort={() => toggleSort('end_time')}
        />
        <TableHeader
          label="Published"
          sortField="is_published"
          currentSort={sortField}
          sortDirection={sortDirection}
          onSort={() => toggleSort('is_published')}
        />
        <TableHeader
          label="Interest"
          sortField="interest"
          currentSort={sortField}
          sortDirection={sortDirection}
          onSort={() => toggleSort('interest')}
        />
        <th className="py-1">Actions</th>
      </tr>
    </thead>
  );
};
