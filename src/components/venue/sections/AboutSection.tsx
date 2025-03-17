
import React from 'react';
import type { Brewery } from '@/types/brewery';

interface AboutSectionProps {
  breweryInfo: Brewery | null;
}

const AboutSection = ({ breweryInfo }: AboutSectionProps) => {
  if (!breweryInfo?.about) return null;
  
  return (
    <div className="space-y-2">
      <h3 className="font-medium text-sm">About</h3>
      <p className="text-sm text-muted-foreground whitespace-pre-line">{breweryInfo.about}</p>
    </div>
  );
};

export default AboutSection;
