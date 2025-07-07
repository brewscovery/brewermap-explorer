
import { useState, useEffect } from 'react';

export const usePWADetection = () => {
  const [isPWA, setIsPWA] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

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

    // Listen for PWA install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    // Listen for PWA installation
    const handleAppInstalled = () => {
      setIsPWA(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    // Listen for display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleChange = () => checkStandalone();
    
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = async () => {
    if (!deferredPrompt) return false;

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsInstallable(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error prompting PWA install:', error);
      return false;
    }
  };

  return { isPWA, isStandalone, isInstallable, promptInstall };
};
