
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
    
    window.addEventListener('focus', onFocus);
    window.addEventListener('blur', onBlur);
    
    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('blur', onBlur);
    };
  }, []);
  
  return isWindowFocused;
};
