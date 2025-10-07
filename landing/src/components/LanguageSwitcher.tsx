import { useState, useEffect } from 'react';
import type { Language } from '../i18n/translations';

interface Props {
  initialLang: Language;
}

export default function LanguageSwitcher({ initialLang }: Props) {
  const [lang, setLang] = useState<Language>(initialLang);

  const toggleLanguage = () => {
    const newLang = lang === 'en' ? 'ja' : 'en';
    
    // Store preference
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('preferred-language', newLang);
    }
    
    // Navigate to the appropriate route
    if (typeof window !== 'undefined') {
      const getBasePath = () => {
        const segments = window.location.pathname.split('/').filter(Boolean);
        return segments.length ? `/${segments[0]}/` : '/';
      };
      const base = getBasePath();
      
      if (newLang === 'ja') {
        window.location.href = base + 'ja/';
      } else {
        window.location.href = base;
      }
    }
  };

  return (
    <button
      onClick={toggleLanguage}
      className="px-3 py-1.5 rounded-md text-sm font-medium bg-bg-card border border-custom-border text-text-secondary hover:text-accent-primary hover:border-accent-primary transition-all"
      aria-label="Switch language"
    >
      {lang === 'en' ? '日本語' : 'English'}
    </button>
  );
}

