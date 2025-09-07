import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { SparklesIcon, GlobeIcon, CheckIcon } from '../../components/Icons';

const LanguageSwitcher: React.FC = () => {
  const { locale, setLocale } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'zh', name: '中文' },
    { code: 'ja', name: '日本語' },
  ];

  const selectLanguage = (langCode: 'en' | 'zh' | 'ja') => {
    setLocale(langCode);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
      >
        <GlobeIcon className="w-5 h-5" />
        <span className="text-sm">{languages.find(l => l.code === locale)?.name}</span>
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700">
          {languages.map(lang => (
            <button
              key={lang.code}
              onClick={() => selectLanguage(lang.code as 'en' | 'zh' | 'ja')}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex justify-between items-center"
            >
              <span>{lang.name}</span>
              {locale === lang.code && <CheckIcon className="w-4 h-4 text-blue-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const AuthLayout: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center bg-blue-500 p-3 rounded-full mb-4">
                 <SparklesIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
        </div>
        <div className="bg-white dark:bg-gray-900 shadow-md rounded-lg p-6 sm:p-8">
            {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;