import React, { createContext, useState, useEffect, useCallback } from 'react';

type Locale = 'en' | 'zh' | 'ja';
type Translations = { [key: string]: string };
type AllTranslations = { [key in Locale]?: Translations };

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

export const I18nContext = createContext<I18nContextType | undefined>(undefined);

const getInitialLocale = (): Locale => {
  const browserLang = navigator.language.split(/[-_]/)[0];
  if (browserLang === 'zh') return 'zh';
  if (browserLang === 'ja') return 'ja';
  return 'en';
};

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocale] = useState<Locale>(getInitialLocale);
  const [translations, setTranslations] = useState<AllTranslations>({});

  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        const [en, zh, ja] = await Promise.all([
          fetch('/locales/en.json').then(res => res.json()),
          fetch('/locales/zh.json').then(res => res.json()),
          fetch('/locales/ja.json').then(res => res.json()),
        ]);
        setTranslations({ en, zh, ja });
      } catch (error) {
        console.error("Failed to load translation files", error);
      }
    };

    fetchTranslations();
  }, []);

  const t = useCallback((key: string): string => {
    const langFile = translations[locale];
    if (!langFile) {
        return key; // Fallback to key if language file hasn't loaded
    }
    return langFile[key] || key;
  }, [locale, translations]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
};
