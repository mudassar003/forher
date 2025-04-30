// src/components/HtmlLangAttribute.tsx
"use client";

import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

/**
 * Component that updates the HTML lang attribute based on the current language
 */
const HtmlLangAttribute: React.FC = () => {
  const { i18n } = useTranslation();
  
  useEffect(() => {
    // Set the lang attribute on the HTML element
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);
  
  // This component doesn't render anything
  return null;
};

export default HtmlLangAttribute;