'use client';

import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useAuth } from './auth-context';

type Language = 'en' | 'hi' | 'ta' | 'te' | 'bn' | 'mr';

interface TranslationContextType {
  language: Language;
}

const TranslationContext = createContext<TranslationContextType>({
  language: 'en'
});

export function TranslationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const language = (user?.preferredLanguage || 'en') as Language;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Set the Google Translate cookie
    // Format: /en/[target_lang]
    const cookieValue = language === 'en' ? '/en/en' : `/en/${language}`;
    document.cookie = `googtrans=${cookieValue}; path=/`;
    
    // Some domains might need domain explicit
    document.cookie = `googtrans=${cookieValue}; path=/; domain=${window.location.hostname}`;

    // Reload page only if the currently active google translate cookie doesn't match the user preference
    // This prevents infinite reload loops
    const currentCookie = document.cookie.split('; ').find(row => row.startsWith('googtrans='))?.split('=')[1];
    
    if (currentCookie && currentCookie !== cookieValue) {
      window.location.reload();
    }
  }, [language]);

  return (
    <TranslationContext.Provider value={{ language }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  return useContext(TranslationContext);
}

