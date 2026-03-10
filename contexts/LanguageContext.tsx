import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Language, i18n, t } from '../utils/i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => any;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('zh');

  // 切换语言
  const toggleLanguage = () => {
    const newLang: Language = language === 'zh' ? 'en' : 'zh';
    setLanguage(newLang);
    i18n.setLanguage(newLang);
  };

  // 翻译函数
  const translate = (key: string): any => {
    return t(key, language);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t: translate }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
