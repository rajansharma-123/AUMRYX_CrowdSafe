import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Check localStorage first
    const saved = localStorage.getItem('crowdsafe_lang');
    if (saved) return saved;
    
    // Auto-detect from browser
    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang.startsWith('hi')) return 'hi';
    return 'en';
  });

  useEffect(() => {
    localStorage.setItem('crowdsafe_lang', language);
    document.documentElement.lang = language;
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'hi' : 'en');
  };

  const t = (enText, hiText) => {
    return language === 'en' ? enText : hiText;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
