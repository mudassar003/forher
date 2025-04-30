// src/hooks/useTranslations.ts
import { useTranslation, TFunction } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import { ReactNode } from 'react';

// Define types for interpolation options
interface InterpolationOptions {
  [key: string]: string | number | boolean | Date | null | undefined;
}

/**
 * Custom hook that combines useTranslation and useLanguage for easier access to translation functionality
 * @returns Object with translation functions and language utilities
 */
export function useTranslations() {
  const { t: originalT, i18n } = useTranslation();
  const { currentLanguage, changeLanguage, isRtl } = useLanguage();
  
  /**
   * Translate a key with interpolation and optional namespace
   * Return type is explicitly cast to string to avoid TypeScript errors
   * @param key Translation key
   * @param options Interpolation options
   * @returns Translated string
   */
  const translate = (key: string, options?: InterpolationOptions): string => {
    return originalT(key, options as Record<string, unknown>) as string;
  };
  
  /**
   * Get current text direction based on language
   * @returns 'rtl' or 'ltr'
   */
  const getDirection = (): 'rtl' | 'ltr' => isRtl ? 'rtl' : 'ltr';
  
  /**
   * Format a date according to the current language
   * @param date The date to format
   * @param options Formatting options
   * @returns Formatted date string
   */
  const formatDate = (date: Date | string | number, options?: Intl.DateTimeFormatOptions): string => {
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString(currentLanguage, options);
  };
  
  /**
   * Format a number according to the current language
   * @param number The number to format
   * @param options Formatting options
   * @returns Formatted number string
   */
  const formatNumber = (number: number, options?: Intl.NumberFormatOptions): string => {
    return number.toLocaleString(currentLanguage, options);
  };
  
  return {
    t: translate,
    currentLanguage,
    changeLanguage,
    isRtl,
    getDirection,
    formatDate,
    formatNumber,
  };
}

export default useTranslations;