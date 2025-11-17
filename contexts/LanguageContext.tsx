import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { LANGUAGES, DEFAULT_LANGUAGE } from '../constants';

// Define the shape of our translations object
interface Translations {
  [key: string]: string;
}

// Define the shape of our LanguageContext
interface LanguageContextType {
  currentLanguage: string;
  setLanguage: (lang: string) => void;
  t: (key: string, interpolations?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<string>(() => {
    // Initialize language from localStorage or use default
    return localStorage.getItem('app_language') || DEFAULT_LANGUAGE;
  });
  const [translations, setTranslations] = useState<Translations>({});
  const [loadingTranslations, setLoadingTranslations] = useState(true);

  // Function to load translations dynamically
  const loadTranslations = useCallback(async (lang: string) => {
    setLoadingTranslations(true);
    try {
      // Dynamically import JSON files based on the language code
      const module = await import(`../translations/${lang}.json`);
      setTranslations(module.default);
    } catch (error) {
      console.error(`Failed to load translations for ${lang}, falling back to English.`, error);
      // Fallback to English if loading fails
      const fallbackModule = await import(`../translations/${DEFAULT_LANGUAGE}.json`);
      setTranslations(fallbackModule.default);
      setCurrentLanguage(DEFAULT_LANGUAGE);
      localStorage.setItem('app_language', DEFAULT_LANGUAGE);
    } finally {
      setLoadingTranslations(false);
    }
  }, []);

  useEffect(() => {
    loadTranslations(currentLanguage);
  }, [currentLanguage, loadTranslations]);

  const setLanguage = useCallback((lang: string) => {
    if (LANGUAGES.some(l => l.code === lang)) {
      setCurrentLanguage(lang);
      localStorage.setItem('app_language', lang);
    } else {
      console.warn(`Attempted to set unsupported language: ${lang}`);
    }
  }, []);

  // Translation function
  const t = useCallback((key: string, interpolations?: Record<string, string | number>): string => {
    let translatedText = translations[key] || key; // Fallback to key if not found

    if (interpolations) {
      for (const [placeholder, value] of Object.entries(interpolations)) {
        translatedText = translatedText.replace(`{{${placeholder}}}`, String(value));
      }
    }
    return translatedText;
  }, [translations]);

  const value = { currentLanguage, setLanguage, t };

  if (loadingTranslations) {
    // Optionally render a loading state, or null to wait for translations
    return (
      <div className="flex items-center justify-center min-h-screen text-lg text-gray-700">
        Loading translations...
      </div>
    );
  }

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};