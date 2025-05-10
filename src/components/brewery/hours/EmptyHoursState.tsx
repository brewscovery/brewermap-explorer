
import React from 'react';
import { Clock } from 'lucide-react';

const EmptyHoursState = () => {
  return (
    <div className="border border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center">
      <Clock className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="font-medium text-lg mb-2">No operating hours set</h3>
      <p className="text-muted-foreground mb-4 max-w-md">
        Set your venue's regular opening and closing hours for the week
      </p>
    </div>
  );
};

export default EmptyHoursState;
