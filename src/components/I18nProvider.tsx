// src/components/I18nProvider.tsx
"use client";

import { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n/config';
import LanguageProvider from '@/contexts/LanguageContext';

interface I18nProviderProps {
  children: React.ReactNode;
}

const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Initialize i18n on the client side
    setMounted(true);
    
    // Check for saved language preference with fallback handling
    const detectLanguage = () => {
      // First, check localStorage
      try {
        const savedLang = localStorage.getItem('i18nextLng');
        if (savedLang && ['en', 'es'].includes(savedLang)) {
          return savedLang;
        }
      } catch (error) {
        console.error('Error accessing localStorage:', error);
      }
      
      // Then, check browser language
      const browserLang = navigator.language.split('-')[0];
      if (['en', 'es'].includes(browserLang)) {
        return browserLang;
      }
      
      // Default to English
      return 'en';
    };
    
    const detectedLang = detectLanguage();
    if (i18n.language !== detectedLang) {
      i18n.changeLanguage(detectedLang);
    }
  }, []);

  // This ensures hydration doesn't cause issues
  if (!mounted) {
    // Return a simple container that won't affect layout
    return <>{children}</>;
  }

  return (
    <I18nextProvider i18n={i18n}>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </I18nextProvider>
  );
};

export default I18nProvider;