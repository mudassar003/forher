// src/utils/serverTranslations.ts
import fs from 'fs';
import path from 'path';
import { cookies } from 'next/headers';

// Define specific types for translations
type TranslationValue = string | number | boolean | null | Record<string, unknown>;

type TranslationsObject = {
  [key: string]: TranslationValue | TranslationsObject;
};

type TranslationsCache = {
  [lang: string]: {
    [namespace: string]: TranslationsObject;
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
export async function getServerTranslations(
  language: string = 'en', 
  namespace: string = 'common'
): Promise<TranslationsObject> {
  try {
    // Check if we have the translations in cache
    if (translationsCache[language]?.[namespace]) {
      return translationsCache[language][namespace];
    }

    // Read translations from the file
    const filePath = path.join(process.cwd(), 'public', 'locales', language, `${namespace}.json`);
    const fileContent = await fs.promises.readFile(filePath, 'utf8');
    const translations = JSON.parse(fileContent) as TranslationsObject;

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

// Define the shape of replacement parameters
interface TranslationParams {
  [key: string]: string | number | boolean | Date | null | undefined;
}

// Interface for the translator object
interface ServerTranslator {
  t: (key: string, params?: TranslationParams) => string;
  language: string;
}

/**
 * Create a translation function for server components
 * @param language Language code
 * @param namespace Translation namespace
 * @returns A translation function (t)
 */
export async function createServerTranslator(
  language?: string, 
  namespace: string = 'common'
): Promise<ServerTranslator> {
  const lang = language || getServerLanguage();
  const translations = await getServerTranslations(lang, namespace);
  
  /**
   * Translate a key with interpolation
   * @param key Translation key (dot notation supported)
   * @param params Replacement parameters
   * @returns Translated string
   */
  const t = (key: string, params?: TranslationParams): string => {
    // Split the key by dots to support nested objects
    const keys = key.split('.');
    let value: unknown = translations;
    
    // Traverse the object using the key parts
    for (const k of keys) {
      if (value && typeof value === 'object' && k in (value as object)) {
        value = (value as Record<string, unknown>)[k];
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
      return value.replace(/{{(\w+)}}/g, (_: string, paramKey: string) => {
        return params[paramKey] !== undefined ? String(params[paramKey]) : `{{${paramKey}}}`;
      });
    }
    
    return value;
  };
  
  return { t, language: lang };
}

export default { getServerTranslations, getServerLanguage, createServerTranslator };