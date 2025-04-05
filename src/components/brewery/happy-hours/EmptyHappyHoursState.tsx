
import React from 'react';

const EmptyHappyHoursState = () => {
  return (
    <div className="text-center py-4 text-muted-foreground">
      <p>No happy hours configured</p>
      <p className="text-xs mt-1">Click "Add Happy Hour" to create one</p>
    </div>
  );
};

export default EmptyHappyHoursState;
