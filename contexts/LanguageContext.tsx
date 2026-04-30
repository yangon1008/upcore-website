import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Language, i18n, t } from '../utils/i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => any;
  isLoading: boolean;
  isAutoDetected: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// 本地存储的key
const LANGUAGE_STORAGE_KEY = 'upcore-language';
const LANGUAGE_AUTO_DETECTED_KEY = 'upcore-language-auto-detected';

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('zh');
  const [isLoading, setIsLoading] = useState(true);
  const [isAutoDetected, setIsAutoDetected] = useState(false);

  // 设置语言的函数，同时保存到本地存储
  const setLanguage = (lang: Language, isManual: boolean = false) => {
    setLanguageState(lang);
    i18n.setLanguage(lang);
    
    // 保存到本地存储
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      if (isManual) {
        // 如果是手动选择，标记为非自动检测
        localStorage.setItem(LANGUAGE_AUTO_DETECTED_KEY, 'false');
        setIsAutoDetected(false);
      }
    } catch (e) {
      console.warn('Failed to save language to localStorage:', e);
    }
  };

  // 切换语言
  const toggleLanguage = () => {
    const newLang: Language = language === 'zh' ? 'en' : 'zh';
    setLanguage(newLang, true); // 手动切换
  };

  // 检测用户的IP地理位置来确定语言
  const detectLanguageByIP = async (): Promise<Language> => {
    try {
      console.log('开始检测IP地理位置...');
      const response = await fetch('/api/geolocation/detect', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('IP检测结果:', data);

      return data.language as Language;
    } catch (error) {
      console.warn('IP语言检测失败，使用默认中文:', error);
      return 'zh';
    }
  };

  // 初始化语言
  useEffect(() => {
    const initLanguage = async () => {
      setIsLoading(true);
      
      try {
        // 首先检查本地存储是否有用户选择的语言
        const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
        const wasAutoDetected = localStorage.getItem(LANGUAGE_AUTO_DETECTED_KEY);
        
        if (savedLanguage && (savedLanguage === 'zh' || savedLanguage === 'en')) {
          // 有保存的语言，使用它
          console.log('使用保存的语言:', savedLanguage);
          setLanguageState(savedLanguage as Language);
          i18n.setLanguage(savedLanguage as Language);
          setIsAutoDetected(wasAutoDetected === 'true');
        } else {
          // 没有保存的语言，通过IP检测
          console.log('没有保存的语言，开始IP检测...');
          const detectedLanguage = await detectLanguageByIP();
          setLanguageState(detectedLanguage);
          i18n.setLanguage(detectedLanguage);
          
          // 保存检测到的语言到本地存储
          try {
            localStorage.setItem(LANGUAGE_STORAGE_KEY, detectedLanguage);
            localStorage.setItem(LANGUAGE_AUTO_DETECTED_KEY, 'true');
            setIsAutoDetected(true);
          } catch (e) {
            console.warn('Failed to save detected language to localStorage:', e);
          }
          
          console.log('检测到的语言:', detectedLanguage);
        }
      } catch (error) {
        console.error('初始化语言失败:', error);
        // 出错时默认使用中文
        setLanguageState('zh');
        i18n.setLanguage('zh');
      } finally {
        setIsLoading(false);
      }
    };

    initLanguage();
  }, []);

  // 翻译函数
  const translate = (key: string): any => {
    return t(key, language);
  };

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage: (lang) => setLanguage(lang, true), 
      toggleLanguage, 
      t: translate,
      isLoading,
      isAutoDetected
    }}>
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
