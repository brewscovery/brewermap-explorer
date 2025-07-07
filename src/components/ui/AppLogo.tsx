
import React from 'react';

interface AppLogoProps {
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  className?: string;
  variant?: 'avatar' | 'full';
}

const AppLogo = ({ size = 'medium', className = '', variant = 'avatar' }: AppLogoProps) => {
  const sizeClasses = {
    small: 'h-8 w-8',
    medium: 'h-12 w-12',
    large: 'h-16 w-16',
    xlarge: 'h-24 w-24'
  };

  const logoSrc = variant === 'full' 
    ? "/lovable-uploads/3732e624-7534-47fb-897c-b234f0f81e21.png"
    : "/lovable-uploads/b02243d4-2a83-4679-87ad-ad231524e20c.png";

  return (
    <div className={`${variant === 'full' ? '' : sizeClasses[size]} ${className}`}>
      <img 
        src={logoSrc} 
        alt="Brewscovery Logo" 
        className="w-full h-full object-contain"
      />
    </div>
  );
};

export default AppLogo;
