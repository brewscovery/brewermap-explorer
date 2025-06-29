
import { useState, useEffect } from 'react';

export const usePWADetection = () => {
  const [isPWA, setIsPWA] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (PWA)
    const checkStandalone = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches;
      const webAppCapable = (window.navigator as any).standalone === true;
      const fromHomeScreen = standalone || webAppCapable;
      
      setIsStandalone(fromHomeScreen);
      setIsPWA(fromHomeScreen);
    };

    // Initial check
    checkStandalone();

    // Listen for display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleChange = () => checkStandalone();
    
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  return { isPWA, isStandalone };
};
