
import React from 'react';

interface BreweryLogoProps {
  logoUrl?: string | null;
  name?: string | null;
  size?: 'small' | 'medium' | 'large';
}

const BreweryLogo = ({ 
  logoUrl, 
  name, 
  size = 'large' 
}: BreweryLogoProps) => {
  const sizeClasses = {
    small: 'h-12 w-12',
    medium: 'h-20 w-20',
    large: 'h-32 w-32'
  };

  if (!logoUrl) {
    return (
      <div 
        className={`
          ${sizeClasses[size]} 
          flex items-center justify-center 
          bg-muted text-muted-foreground 
          border rounded-lg font-semibold text-2xl
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
        border 
        overflow-hidden 
        flex items-center justify-center
        bg-white
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
