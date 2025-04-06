
import React from 'react';

const EmptyDailySpecialsState = () => {
  return (
    <div className="text-center py-4 text-muted-foreground">
      <p>No daily specials configured</p>
      <p className="text-xs mt-1">Click "Add Daily Special" to create one</p>
    </div>
  );
};

export default EmptyDailySpecialsState;
