// src/utils/serverTranslations.ts
import fs from 'fs';
import path from 'path';
import { cookies } from 'next/headers';

type TranslationsCache = {
  [lang: string]: {
    [namespace: string]: {
      [key: string]: any
    }
  }
};

// Cache translations to avoid reading files repeatedly
const translationsCache: TranslationsCache = {};

/**
 * Get translations for a specific language and namespace for use in server components
 * @param language Language code (e.g., 'en', 'es')
 * @param namespace Namespace for translations (default: 'common')
 * @returns Translation object or empty object if not found
 */
export async function getServerTranslations(language: string = 'en', namespace: string = 'common') {
  try {
    // Check if we have the translations in cache
    if (translationsCache[language]?.[namespace]) {
      return translationsCache[language][namespace];
    }

    // Read translations from the file
    const filePath = path.join(process.cwd(), 'public', 'locales', language, `${namespace}.json`);
    const fileContent = await fs.promises.readFile(filePath, 'utf8');
    const translations = JSON.parse(fileContent);

    // Cache the translations
    if (!translationsCache[language]) {
      translationsCache[language] = {};
    }
    translationsCache[language][namespace] = translations;

    return translations;
  } catch (error) {
    console.error(`Error loading translations for ${language}/${namespace}:`, error);
    
    // Fallback to English if the requested language is not available
    if (language !== 'en') {
      return getServerTranslations('en', namespace);
    }
    
    return {};
  }
}

/**
 * Get the current language from cookies for server components
 * @returns The current language code
 */
export function getServerLanguage(): string {
  try {
    const cookieStore = cookies();
    const langCookie = cookieStore.get('i18nextLng');
    
    // Return the language from cookie if available and supported
    if (langCookie?.value && ['en', 'es'].includes(langCookie.value)) {
      return langCookie.value;
    }
    
    // Default to English
    return 'en';
  } catch (error) {
    console.error('Error getting language from cookies:', error);
    return 'en';
  }
}

/**
 * Create a translation function for server components
 * @param language Language code
 * @param namespace Translation namespace
 * @returns A translation function (t)
 */
export async function createServerTranslator(language?: string, namespace: string = 'common') {
  const lang = language || getServerLanguage();
  const translations = await getServerTranslations(lang, namespace);
  
  /**
   * Translate a key with interpolation
   * @param key Translation key (dot notation supported)
   * @param params Replacement parameters
   * @returns Translated string
   */
  const t = (key: string, params?: Record<string, any>): string => {
    // Split the key by dots to support nested objects
    const keys = key.split('.');
    let value = translations;
    
    // Traverse the object using the key parts
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Key not found
        return key;
      }
    }
    
    // If the result is not a string, return the key
    if (typeof value !== 'string') {
      return key;
    }
    
    // Handle parameter replacement
    if (params) {
      return value.replace(/{{(\w+)}}/g, (_, paramKey) => {
        return params[paramKey] !== undefined ? String(params[paramKey]) : `{{${paramKey}}}`;
      });
    }
    
    return value;
  };
  
  return { t, language: lang };
}

export default { getServerTranslations, getServerLanguage, createServerTranslator };