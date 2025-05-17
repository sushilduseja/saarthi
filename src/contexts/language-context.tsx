
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { translations, type TranslationKey } from '@/lib/translations';

export type Language = 'en' | 'hi' | 'mr';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, replacements?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useLocalStorage<Language>('saarthi-language', 'mr'); // Default to Marathi

  const t = (key: TranslationKey, replacements?: Record<string, string>): string => {
    let text = translations[language]?.[key] || translations['en']?.[key] || key; // Fallback to English, then key itself
    if (replacements) {
      Object.keys(replacements).forEach(rKey => {
        const regex = new RegExp(`{${rKey}}`, 'g');
        text = text.replace(regex, replacements[rKey]);
      });
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
