
import React from 'react';

interface AppLogoProps {
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  className?: string;
}

const AppLogo = ({ size = 'medium', className = '' }: AppLogoProps) => {
  const sizeClasses = {
    small: 'h-8 w-8',
    medium: 'h-12 w-12',
    large: 'h-16 w-16',
    xlarge: 'h-24 w-24'
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <img 
        src="/lovable-uploads/b02243d4-2a83-4679-87ad-ad231524e20c.png" 
        alt="Brewscovery Logo" 
        className="w-full h-full object-contain"
      />
    </div>
  );
};

export default AppLogo;
