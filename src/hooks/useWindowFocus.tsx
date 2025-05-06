
import { useState, useEffect } from 'react';

export const useWindowFocus = () => {
  const [isWindowFocused, setIsWindowFocused] = useState(document.hasFocus());
  
  useEffect(() => {
    const onFocus = () => {
      console.log('Window gained focus');
      setIsWindowFocused(true);
    };
    
    const onBlur = () => {
      console.log('Window lost focus');
      setIsWindowFocused(false);
    };
    
    // Ensure we get the current focus state on mount
    setIsWindowFocused(document.hasFocus());
    
    window.addEventListener('focus', onFocus);
    window.addEventListener('blur', onBlur);
    
    // Also handle visibility change events which can occur in some scenarios
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        console.log('Document became visible');
        setIsWindowFocused(true);
      } else {
        console.log('Document hidden');
        setIsWindowFocused(false);
      }
    });
    
    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('visibilitychange', () => {});
    };
  }, []);
  
  return isWindowFocused;
};
