
import React from 'react';

export const EmptyEventsState: React.FC = () => {
  return (
    <tr>
      <td colSpan={7} className="py-4 text-center text-muted-foreground">
        No events found.
      </td>
    </tr>
  );
};
