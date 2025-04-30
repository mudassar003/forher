// src/contexts/LanguageContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface LanguageContextType {
  currentLanguage: string;
  changeLanguage: (lang: string) => void;
  isRtl: boolean;
}

// Create the context with a default value
const LanguageContext = createContext<LanguageContextType>({
  currentLanguage: 'en',
  changeLanguage: () => {},
  isRtl: false,
});

// Custom hook to use the language context
export const useLanguage = () => useContext(LanguageContext);

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'en');
  const [isRtl, setIsRtl] = useState(false);

  useEffect(() => {
    // Update the current language when i18n language changes
    setCurrentLanguage(i18n.language);
    
    // Check if the language is RTL (for future support)
    setIsRtl(['ar', 'he', 'fa', 'ur'].includes(i18n.language));
  }, [i18n.language]);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    // Save the language preference to localStorage
    try {
      localStorage.setItem('i18nextLng', lang);
    } catch (e) {
      console.error('Could not save language preference:', e);
    }
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, changeLanguage, isRtl }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageProvider;