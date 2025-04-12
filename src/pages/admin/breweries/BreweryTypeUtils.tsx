
import React from 'react';
import { Badge } from '@/components/ui/badge';

export const getBreweryTypeBadge = (type: string | null) => {
  if (!type) return null;
  
  const types: Record<string, { label: string, className: string }> = {
    micro: { 
      label: 'Micro', 
      className: 'bg-blue-100 text-blue-800 border-blue-300' 
    },
    regional: { 
      label: 'Regional', 
      className: 'bg-green-100 text-green-800 border-green-300' 
    },
    brewpub: { 
      label: 'Brewpub', 
      className: 'bg-amber-100 text-amber-800 border-amber-300' 
    },
    large: { 
      label: 'Large', 
      className: 'bg-purple-100 text-purple-800 border-purple-300' 
    },
    contract: { 
      label: 'Contract', 
      className: 'bg-indigo-100 text-indigo-800 border-indigo-300' 
    },
    proprietor: { 
      label: 'Proprietor', 
      className: 'bg-pink-100 text-pink-800 border-pink-300' 
    }
  };
  
  const breweryType = types[type.toLowerCase()] || {
    label: type, 
    className: 'bg-gray-100 text-gray-800 border-gray-300'
  };
  
  return (
    <Badge variant="outline" className={breweryType.className}>
      {breweryType.label}
    </Badge>
  );
};
