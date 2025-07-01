
import React from 'react';

interface BreweryLogoProps {
  logoUrl?: string | null;
  name?: string | null;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
}

const BreweryLogo = ({ 
  logoUrl, 
  name, 
  size = 'large' 
}: BreweryLogoProps) => {
  const sizeClasses = {
    small: 'h-12 w-12',
    medium: 'h-20 w-20',
    large: 'h-32 w-32',
    xlarge: 'h-40 w-40'
  };

  if (!logoUrl) {
    return (
      <div 
        className={`
          ${sizeClasses[size]} 
          flex items-center justify-center 
          bg-brewscovery-cream text-brewscovery-teal
          border-2 border-brewscovery-teal rounded-lg font-semibold text-2xl
          shadow-sm
        `}
      >
        {name?.[0] || 'B'}
      </div>
    );
  }

  return (
    <div 
      className={`
        ${sizeClasses[size]} 
        rounded-lg 
        border-2 border-brewscovery-teal
        overflow-hidden 
        flex items-center justify-center
        bg-white shadow-sm
      `}
    >
      <img 
        src={logoUrl} 
        alt={name || 'Brewery logo'} 
        className="object-contain w-full h-full p-2"
      />
    </div>
  );
};

export default BreweryLogo;
