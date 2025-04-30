// src/components/LanguageSwitcher.tsx
"use client";

import React, { useState } from 'react';
import { FiGlobe } from 'react-icons/fi';
import { useLanguage } from '@/contexts/LanguageContext';

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' }
];

const LanguageSwitcher: React.FC = () => {
  const { currentLanguage, changeLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  
  const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0];
  
  const handleChangeLanguage = (code: string): void => {
    changeLanguage(code);
    setIsOpen(false);
  };
  
  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 text-gray-800 hover:text-[#fc4e87] px-2 py-1 rounded-md transition-all focus:outline-none"
        aria-label="Change language"
      >
        <FiGlobe className="text-lg" />
        <span className="hidden sm:inline-block">{currentLang.flag}</span>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-50 overflow-hidden">
          <div className="py-1">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleChangeLanguage(language.code)}
                className={`flex items-center px-4 py-2 text-sm w-full text-left ${
                  currentLanguage === language.code ? 'bg-gray-100 text-[#fc4e87]' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="mr-2">{language.flag}</span>
                <span>{language.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Close the dropdown if clicked outside */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default LanguageSwitcher;