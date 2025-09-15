import React, { createContext, useState, useCallback } from 'react';

import en from '../locales/en.json';
import zh from '../locales/zh.json';
import ja from '../locales/ja.json';

type Locale = 'en' | 'zh' | 'ja';
type Translations = { [key: string]: string };
type AllTranslations = { [key in Locale]: Translations };

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: { [key: string]: string }) => string;
}

export const I18nContext = createContext<I18nContextType | undefined>(undefined);

const getInitialLocale = (): Locale => {
  const browserLang = navigator.language.split(/[-_]/)[0];
  if (browserLang === 'zh') return 'zh';
  if (browserLang === 'ja') return 'ja';
  return 'en';
};

const allTranslations: AllTranslations = { en, zh, ja };

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocale] = useState<Locale>(getInitialLocale);

  const t = useCallback((key: string, params?: { [key: string]: string }): string => {
    const langFile = allTranslations[locale];
    let translation = langFile?.[key] || key;
    
    if (params) {
      Object.keys(params).forEach(paramKey => {
        translation = translation.replace(`{${paramKey}}`, params[paramKey]);
      });
    }
    
    return translation;
  }, [locale]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
};
