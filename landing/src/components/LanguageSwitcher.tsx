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
    
    // Trigger page reload with new language
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('lang', newLang);
      // Use replace to avoid back button issues
      window.location.replace(url.toString());
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

