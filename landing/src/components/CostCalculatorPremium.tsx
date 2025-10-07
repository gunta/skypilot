import { useState, useEffect } from 'react';
import { getTranslation, type Language } from '../i18n/translations';
import ScrollReveal from './ScrollReveal';
import * as flags from 'country-flag-icons/react/3x2';

interface Props {
  lang: Language;
}

interface CurrencyRates {
  [key: string]: number;
}

const exchangeRates: CurrencyRates = {
  USD: 1,
  EUR: 0.85,
  GBP: 0.73,
  JPY: 110.5,
  CNY: 6.45,
  KRW: 1180,
  INR: 74.5,
  CAD: 1.25,
  AUD: 1.35,
  CHF: 0.92,
  SGD: 1.35,
  HKD: 7.78,
  NZD: 1.42,
  SEK: 8.6,
  NOK: 8.5,
  DKK: 6.3,
  RUB: 73.5,
  BRL: 5.2,
  MXN: 20.1,
  ZAR: 14.5,
  AED: 3.67,
  SAR: 3.75,
  THB: 33.0,
  MYR: 4.15,
  IDR: 14300,
  PHP: 50.5,
  VND: 23000,
  PLN: 3.9,
  CZK: 21.5,
  HUF: 300,
  RON: 4.2,
  BGN: 1.65,
  HRK: 6.35,
  TRY: 8.5,
  ISK: 125,
  ILS: 3.2,
  CLP: 750,
  ARS: 98,
  COP: 3800,
  PEN: 4.1,
  UYU: 43.5,
  TWD: 28,
  PKR: 160,
  BDT: 85,
  LKR: 200,
  NGN: 410,
  EGP: 15.7,
  KES: 110,
  GHS: 6.1,
  MAD: 9.0,
  TND: 2.8,
  UAH: 27,
  KZT: 425
};

// OpenAI Sora 2 exact pricing per second
type ModelResolution = {
  model: 'sora-2' | 'sora-2-pro';
  resolution: string;
  pricePerSecond: number;
  displayName: string;
  icon: JSX.Element;
  gradient: string;
};

const SORA_PRICING: ModelResolution[] = [
  { 
    model: 'sora-2', 
    resolution: '1280x720', 
    pricePerSecond: 0.10, 
    displayName: 'Sora 2 - HD (1280×720)',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    gradient: 'from-blue-500 to-cyan-500'
  },
  { 
    model: 'sora-2-pro', 
    resolution: '1280x720', 
    pricePerSecond: 0.30, 
    displayName: 'Sora 2 Pro - HD (1280×720)',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    gradient: 'from-purple-500 to-pink-500'
  },
  { 
    model: 'sora-2-pro', 
    resolution: '1792x1024', 
    pricePerSecond: 0.50, 
    displayName: 'Sora 2 Pro - WSXGA (1792×1024)',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
      </svg>
    ),
    gradient: 'from-amber-500 to-orange-500'
  },
];

// Sora only supports 4, 8, and 12 second videos
const ALLOWED_DURATIONS = [4, 8, 12];

// Duration presets for common video use cases
interface DurationPreset {
  name: string;
  duration: number; // in seconds
  icon: JSX.Element;
  description?: string;
}

interface DurationPresetTranslated extends DurationPreset {
  nameKey: string;
  descKey: string;
}

const DURATION_PRESETS: DurationPresetTranslated[] = [
  {
    name: 'Instagram Reel',
    nameKey: 'preset.instagramReel',
    duration: 60,
    descKey: 'preset.60sec',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="url(#instagram-gradient)">
        <defs>
          <radialGradient id="instagram-gradient" cx="30%" cy="107%" r="150%">
            <stop offset="0%" stopColor="#fdf497" />
            <stop offset="5%" stopColor="#fdf497" />
            <stop offset="45%" stopColor="#fd5949" />
            <stop offset="60%" stopColor="#d6249f" />
            <stop offset="90%" stopColor="#285AEB" />
          </radialGradient>
        </defs>
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z"/>
      </svg>
    ),
    description: 'Up to 60 seconds'
  },
  {
    name: 'Instagram Story',
    nameKey: 'preset.instagramStory',
    duration: 15,
    descKey: 'preset.15sec',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="url(#instagram-gradient-2)">
        <defs>
          <radialGradient id="instagram-gradient-2" cx="30%" cy="107%" r="150%">
            <stop offset="0%" stopColor="#fdf497" />
            <stop offset="5%" stopColor="#fdf497" />
            <stop offset="45%" stopColor="#fd5949" />
            <stop offset="60%" stopColor="#d6249f" />
            <stop offset="90%" stopColor="#285AEB" />
          </radialGradient>
        </defs>
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z"/>
      </svg>
    ),
    description: '15 seconds'
  },
  {
    name: 'TikTok',
    nameKey: 'preset.tiktok',
    duration: 60,
    descKey: 'preset.60sec',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24">
        <path fill="#FF0050" d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
        <path fill="#00F2EA" d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" opacity="0.5"/>
      </svg>
    ),
    description: 'Up to 60 seconds'
  },
  {
    name: 'YouTube Shorts',
    nameKey: 'preset.youtubeShorts',
    duration: 60,
    descKey: 'preset.60sec',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#FF0000">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
    description: 'Up to 60 seconds'
  },
  {
    name: 'X/Twitter',
    nameKey: 'preset.xTwitter',
    duration: 140,
    descKey: 'preset.140sec',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#000000">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
    description: 'Up to 2:20'
  },
  {
    name: 'TV Commercial',
    nameKey: 'preset.tvCommercial',
    duration: 30,
    descKey: 'preset.30sec',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    description: '30 seconds'
  },
  {
    name: 'Product Demo',
    nameKey: 'preset.productDemo',
    duration: 120,
    descKey: 'preset.2min',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
      </svg>
    ),
    description: '2 minutes'
  },
  {
    name: 'Music Video',
    nameKey: 'preset.musicVideo',
    duration: 210,
    descKey: 'preset.3min30',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM21 16c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
      </svg>
    ),
    description: '3:30'
  },
  {
    name: 'Short Film',
    nameKey: 'preset.shortFilm',
    duration: 600,
    descKey: 'preset.10min',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
      </svg>
    ),
    description: '10 minutes'
  }
];

export default function CostCalculatorPremium({ lang }: Props) {
  // Get initial values from URL on mount
  const getInitialValues = () => {
    if (typeof window === 'undefined') {
      return {
        currency: lang === 'ja' ? 'JPY' : 'USD',
        duration: 4,
        modelIndex: 0,
        videos: 1  // Changed default to 1
      };
    }
    
    const params = new URLSearchParams(window.location.search);
    
    // Currency
    const urlCurrency = params.get('currency');
    const currency = (urlCurrency && exchangeRates[urlCurrency]) ? urlCurrency : (lang === 'ja' ? 'JPY' : 'USD');
    
    // Duration
    const urlDuration = params.get('duration');
    const duration = urlDuration ? parseInt(urlDuration) : 4;
    
    // Model and Resolution from URL params
    const urlModel = params.get('model');
    const urlResolution = params.get('resolution');
    
    // Find matching pricing index based on model and resolution
    let modelIndex = 0;
    if (urlModel && urlResolution) {
      const foundIndex = SORA_PRICING.findIndex(
        p => p.model === urlModel && p.resolution === urlResolution
      );
      if (foundIndex !== -1) {
        modelIndex = foundIndex;
      }
    }
    
    // Video count
    const urlVideos = params.get('videos');
    const videos = urlVideos ? parseInt(urlVideos) : 1;  // Changed default to 1
    
    return { currency, duration, modelIndex, videos };
  };

  const initialValues = getInitialValues();
  
  const [videoCount, setVideoCount] = useState(initialValues.videos);
  const [duration, setDuration] = useState(initialValues.duration);
  const [selectedPricingIndex, setSelectedPricingIndex] = useState(initialValues.modelIndex);
  const [currency, setCurrency] = useState(initialValues.currency);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showCustomDuration, setShowCustomDuration] = useState(false);
  const [customDurationInput, setCustomDurationInput] = useState('');
  const [showPresets, setShowPresets] = useState(false);

  // Update URL when any parameter changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    params.set('currency', currency);
    params.set('duration', duration.toString());
    params.set('model', SORA_PRICING[selectedPricingIndex].model);
    params.set('resolution', SORA_PRICING[selectedPricingIndex].resolution);
    params.set('videos', videoCount.toString());
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  }, [currency, duration, selectedPricingIndex, videoCount]);
  
  const t = (key: string) => getTranslation(lang, key);
  
  // Calculate exact cost based on OpenAI pricing
  const selectedPricing = SORA_PRICING[selectedPricingIndex];
  const costPerVideo = selectedPricing.pricePerSecond * duration;
  const totalCostUSD = videoCount * costPerVideo;
  const totalCostLocal = totalCostUSD * exchangeRates[currency];
  
  const formatCurrency = (amount: number, curr: string) => {
    const formatter = new Intl.NumberFormat(lang === 'ja' ? 'ja-JP' : 'en-US', {
      style: 'currency',
      currency: curr,
      minimumFractionDigits: curr === 'JPY' || curr === 'KRW' ? 0 : 2,
      maximumFractionDigits: curr === 'JPY' || curr === 'KRW' ? 0 : 2,
    });
    return formatter.format(amount);
  };
  
  // Map currency codes to country codes for flags
  const currencyToCountry: { [key: string]: string } = {
    USD: 'US', EUR: 'EU', GBP: 'GB', JPY: 'JP', CNY: 'CN', KRW: 'KR', INR: 'IN',
    CAD: 'CA', AUD: 'AU', CHF: 'CH', SGD: 'SG', HKD: 'HK', NZD: 'NZ', SEK: 'SE',
    NOK: 'NO', DKK: 'DK', RUB: 'RU', BRL: 'BR', MXN: 'MX', ZAR: 'ZA', AED: 'AE',
    SAR: 'SA', THB: 'TH', MYR: 'MY', IDR: 'ID', PHP: 'PH', VND: 'VN', PLN: 'PL',
    CZK: 'CZ', HUF: 'HU', RON: 'RO', BGN: 'BG', HRK: 'HR', TRY: 'TR', ISK: 'IS',
    ILS: 'IL', CLP: 'CL', ARS: 'AR', COP: 'CO', PEN: 'PE', UYU: 'UY', TWD: 'TW',
    PKR: 'PK', BDT: 'BD', LKR: 'LK', NGN: 'NG', EGP: 'EG', KES: 'KE', GHS: 'GH',
    MAD: 'MA', TND: 'TN', UAH: 'UA', KZT: 'KZ'
  };
  
  const getFlag = (currencyCode: string) => {
    const countryCode = currencyToCountry[currencyCode];
    if (!countryCode) return null;
    const FlagComponent = (flags as any)[countryCode];
    return FlagComponent ? <FlagComponent className="w-5 h-3.5 rounded-sm shadow-sm" /> : null;
  };

  // Parse custom duration input and round up to nearest 4 seconds
  const parseCustomDuration = (input: string): number | null => {
    const trimmed = input.trim().toLowerCase();
    let totalSeconds = 0;
    
    // Try parsing "1:30:45" format (hours:minutes:seconds)
    const colonMatch3 = trimmed.match(/^(\d+):(\d+):(\d+)$/);
    if (colonMatch3) {
      const hours = parseInt(colonMatch3[1]);
      const minutes = parseInt(colonMatch3[2]);
      const seconds = parseInt(colonMatch3[3]);
      totalSeconds = hours * 3600 + minutes * 60 + seconds;
      return Math.ceil(totalSeconds / 4) * 4;
    }
    
    // Try parsing "1:30" format (minutes:seconds or hours:minutes)
    const colonMatch2 = trimmed.match(/^(\d+):(\d+)$/);
    if (colonMatch2) {
      const first = parseInt(colonMatch2[1]);
      const second = parseInt(colonMatch2[2]);
      // Assume minutes:seconds if first number is < 24, otherwise hours:minutes
      if (first < 24) {
        totalSeconds = first * 60 + second;
      } else {
        totalSeconds = first * 60 + second;
      }
      return Math.ceil(totalSeconds / 4) * 4;
    }
    
    // Try parsing plain seconds
    const secondsMatch = trimmed.match(/^(\d+)s?$/);
    if (secondsMatch) {
      totalSeconds = parseInt(secondsMatch[1]);
      return Math.ceil(totalSeconds / 4) * 4;
    }
    
    // Try parsing complex format: "1h30m24s" or "1h 30m 24s" or "1hour 30min 24sec"
    const hours = trimmed.match(/(\d+)\s*h(?:our)?s?/);
    const minutes = trimmed.match(/(\d+)\s*m(?:in)?(?:ute)?s?/);
    const seconds = trimmed.match(/(\d+)\s*s(?:ec)?(?:ond)?s?/);
    
    if (hours || minutes || seconds) {
      totalSeconds = 
        (hours ? parseInt(hours[1]) * 3600 : 0) +
        (minutes ? parseInt(minutes[1]) * 60 : 0) +
        (seconds ? parseInt(seconds[1]) : 0);
      return Math.ceil(totalSeconds / 4) * 4;
    }
    
    return null;
  };
  
  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      const parts = [`${hours}h`];
      if (mins > 0) parts.push(`${mins}m`);
      if (secs > 0) parts.push(`${secs}s`);
      return parts.join(' ');
    }
    
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  };
  
  const handleCustomDurationSubmit = () => {
    const parsed = parseCustomDuration(customDurationInput);
    if (parsed && parsed >= 4) {
      setDuration(parsed);
      setCustomDurationInput(formatDuration(parsed));
    } else {
      alert('Please enter a valid duration (e.g., 1:30, 45s, 1h30m, 1h30m24s). Minimum 4 seconds.');
    }
  };

  const popularCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CNY'];
  const allCurrencies = Object.keys(exchangeRates).sort();

  return (
    <div className="max-w-5xl mx-auto">
      <ScrollReveal delay={0.1}>
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-2 mb-6 text-xs font-bold tracking-wider text-accent-primary uppercase glass-card rounded-full">
            {t('calculator.badge')}
          </span>
          <h2 className="text-5xl sm:text-6xl font-black mb-4">
            <span className="text-gradient-animate">
              {t('calculator.title')}
            </span>
          </h2>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            {t('calculator.subtitle')}
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.2}>
        <div className="glass-card rounded-3xl p-8 lg:p-10">
          <div className="grid lg:grid-cols-2 gap-10">
            {/* Left: Controls */}
            <div className="space-y-8">
              {/* Model & Resolution Selector */}
              <div>
                <label className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold text-white">
                    {t('calculator.model')}
                  </span>
                  <span className="px-3 py-1 bg-accent-primary/20 rounded-lg text-xs font-semibold text-accent-primary">
                    ${selectedPricing.pricePerSecond}/sec
                  </span>
                </label>
                <div className="space-y-3">
                  {SORA_PRICING.map((pricing, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedPricingIndex(index)}
                      className={`
                        w-full p-4 rounded-xl text-left transition-all relative overflow-hidden group
                        ${selectedPricingIndex === index
                          ? 'bg-gradient-to-r from-accent-primary/30 to-accent-secondary/30 border-2 border-accent-primary scale-[1.02] shadow-lg shadow-accent-primary/20'
                          : 'glass-card hover:border-accent-primary/50 hover:scale-[1.01]'}
                      `}
                    >
                      {/* Gradient background on hover */}
                      <div className={`absolute inset-0 bg-gradient-to-r ${pricing.gradient} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                      
                      <div className="flex items-center gap-4 relative z-10">
                        {/* Icon with gradient background */}
                        <div className={`p-3 rounded-lg bg-gradient-to-br ${pricing.gradient} text-white flex-shrink-0 shadow-lg`}>
                          {pricing.icon}
                        </div>
                        
                        <div className="flex-1">
                          <div className="font-bold text-white mb-1 flex items-center gap-2">
                            {pricing.displayName}
                            {pricing.model === 'sora-2-pro' && (
                              <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-xs font-bold rounded-full">
                                PRO
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-text-muted">
                            ${pricing.pricePerSecond.toFixed(2)} per second
                          </div>
                        </div>
                        
                        {selectedPricingIndex === index && (
                          <svg className="w-6 h-6 text-accent-primary flex-shrink-0 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                
                {/* Model info display */}
                <div className="mt-4 p-4 glass-card rounded-xl animate-fade-in">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${selectedPricing.gradient} bg-opacity-20 flex-shrink-0`}>
                      <svg className="w-5 h-5 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 space-y-2">
                      <h4 className="font-semibold text-white text-sm">
                        {selectedPricing.model === 'sora-2' 
                          ? t('model.sora2.title')
                          : t('model.sora2pro.title')}
                      </h4>
                      <p className="text-xs text-text-secondary leading-relaxed">
                        {selectedPricing.model === 'sora-2'
                          ? t('model.sora2.desc')
                          : t('model.sora2pro.desc')}
                      </p>
                      <div className="text-xs text-text-muted">
                        {selectedPricing.model === 'sora-2'
                          ? t('model.sora2.useCases')
                          : t('model.sora2pro.useCases')}
                      </div>
                      <div className="flex gap-4 mt-2">
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <span className="text-xs text-text-secondary">
                            {selectedPricing.model === 'sora-2'
                              ? t('model.sora2.speed')
                              : t('model.sora2pro.speed')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                          </svg>
                          <span className="text-xs text-text-secondary">
                            {selectedPricing.model === 'sora-2'
                              ? t('model.sora2.quality')
                              : t('model.sora2pro.quality')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Duration Selector */}
              <div>
                <label className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold text-white">
                    {t('calculator.duration')}
                  </span>
                  <span className="px-4 py-2 bg-gradient-to-r from-accent-secondary/20 to-accent-primary/20 rounded-xl font-bold text-xl text-white">
                    {formatDuration(duration)}
                  </span>
                </label>
                
                {/* Quick duration buttons */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {ALLOWED_DURATIONS.map((dur) => (
                    <button
                      key={dur}
                      onClick={() => {
                        setDuration(dur);
                        setShowCustomDuration(false);
                        setShowPresets(false);
                      }}
                      className={`
                        py-3 px-4 rounded-xl font-bold text-lg transition-all
                        ${duration === dur && !showCustomDuration && !showPresets
                          ? 'bg-gradient-to-r from-accent-secondary to-accent-primary text-white scale-105 shadow-lg'
                          : 'glass-card hover:scale-105 hover:border-accent-primary/50'}
                      `}
                    >
                      {dur}s
                    </button>
                  ))}
                </div>
                
                {/* Toggle buttons for Custom and Presets */}
                <div className="flex gap-3 mb-4">
                  <button
                    onClick={() => {
                      setShowCustomDuration(!showCustomDuration);
                      setShowPresets(false);
                    }}
                    className={`
                      flex-1 py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2
                      ${showCustomDuration
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                        : 'glass-card hover:border-accent-primary/50 text-text-secondary hover:text-white'}
                    `}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    {t('calculator.customDuration')}
                  </button>
                  <button
                    onClick={() => {
                      setShowPresets(!showPresets);
                      setShowCustomDuration(false);
                    }}
                    className={`
                      flex-1 py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2
                      ${showPresets
                        ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-lg'
                        : 'glass-card hover:border-accent-primary/50 text-text-secondary hover:text-white'}
                    `}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    {t('calculator.popularPresets')}
                  </button>
                </div>
                
                {/* Duration Presets */}
                {showPresets && (
                  <div className="p-4 glass-card rounded-xl animate-fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {DURATION_PRESETS.map((preset) => {
                        const roundedDuration = Math.ceil(preset.duration / 4) * 4;
                        return (
                          <button
                            key={preset.name}
                            onClick={() => {
                              setDuration(roundedDuration);
                              setShowPresets(false);
                            }}
                            className={`
                              p-4 rounded-xl transition-all flex items-center gap-3 text-left group
                              ${duration === roundedDuration
                                ? 'bg-gradient-to-r from-accent-primary/20 to-accent-secondary/20 border-accent-primary shadow-lg'
                                : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-accent-primary/50'}
                              border
                            `}
                          >
                            <div className="flex-shrink-0">
                              {preset.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-white text-sm">{t(preset.nameKey)}</div>
                              <div className="text-xs text-text-muted">{t(preset.descKey)}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {showCustomDuration && (
                  <div className="p-4 glass-card rounded-xl animate-fade-in">
                    <label className="text-sm text-text-muted mb-2 block">
                      {t('calculator.customPlaceholder')}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customDurationInput}
                        onChange={(e) => setCustomDurationInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleCustomDurationSubmit()}
                        placeholder={lang === 'ja' ? '1時間30分' : '1h30m'}
                        className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-text-muted focus:border-accent-primary focus:outline-none"
                      />
                      <button
                        onClick={handleCustomDurationSubmit}
                        className="px-6 py-2 bg-gradient-to-r from-accent-primary to-accent-secondary text-white font-semibold rounded-lg hover:scale-105 transition-transform"
                      >
                        {lang === 'ja' ? '設定' : 'Set'}
                      </button>
                    </div>
                    <p className="text-xs text-text-muted mt-2">
                      {t('calculator.customHint')}
                    </p>
                  </div>
                )}
                
                <p className="text-xs text-text-muted mt-2 text-center">
                  {t('calculator.soraIncrement')}
                </p>
              </div>

              {/* Video Count Slider */}
              <div>
                <label className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold text-white">
                    {t('calculator.numberOfVideos')}
                  </span>
                  <span className="px-4 py-2 bg-gradient-to-r from-accent-primary/20 to-accent-secondary/20 rounded-xl font-bold text-xl text-white">
                    {videoCount}
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={videoCount}
                    onChange={(e) => setVideoCount(parseInt(e.target.value))}
                    className="w-full h-3 bg-white/10 rounded-full appearance-none cursor-pointer slider-premium"
                    style={{
                      background: `linear-gradient(to right, #00d4ff 0%, #8b5cf6 ${videoCount}%, rgba(255,255,255,0.1) ${videoCount}%)`,
                    }}
                  />
                  <div className="flex justify-between mt-2 text-xs text-text-muted">
                    <span>1</span>
                    <span>25</span>
                    <span>50</span>
                    <span>75</span>
                    <span>100</span>
                  </div>
                </div>
              </div>

              {/* Currency Selector */}
              <div>
                <label className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold text-white">
                    {t('calculator.currency')}
                  </span>
                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-xs text-accent-primary hover:text-accent-secondary transition-colors"
                  >
                    {showAdvanced ? 'Show Less' : 'Show All'} →
                  </button>
                </label>
                
                {/* Popular Currencies */}
                <div className="grid grid-cols-5 gap-2 mb-3">
                  {popularCurrencies.map((curr) => (
                    <button
                      key={curr}
                      onClick={() => setCurrency(curr)}
                      className={`
                        px-3 py-2 rounded-xl text-sm font-semibold transition-all flex flex-col items-center gap-1
                        ${currency === curr 
                          ? 'bg-gradient-to-r from-accent-primary to-accent-secondary text-white scale-105 shadow-lg' 
                          : 'glass-card hover:scale-105 hover:border-accent-primary/50'}
                      `}
                    >
                      {getFlag(curr)}
                      <span className="text-xs">{curr}</span>
                    </button>
                  ))}
                </div>
                
                {/* All Currencies (when expanded) */}
                {showAdvanced && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mt-4 p-4 bg-white/5 rounded-2xl max-h-64 overflow-y-auto">
                    {allCurrencies.filter(c => !popularCurrencies.includes(c)).map((curr) => (
                      <button
                        key={curr}
                        onClick={() => setCurrency(curr)}
                        className={`
                          px-2 py-2 rounded-lg text-xs font-medium transition-all flex flex-col items-center gap-1
                          ${currency === curr 
                            ? 'bg-gradient-to-r from-accent-primary to-accent-secondary text-white scale-105' 
                            : 'text-text-secondary hover:text-white hover:bg-white/10 hover:scale-105'}
                        `}
                      >
                        {getFlag(curr)}
                        <span>{curr}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Results */}
            <div className="flex flex-col justify-center">
              <div className="glass-card rounded-2xl p-8 bg-gradient-to-br from-accent-primary/10 via-transparent to-accent-secondary/10 border border-white/20">
                <div className="text-center">
                  <div className="text-sm text-text-muted uppercase tracking-wider mb-2">
                    Estimated Cost
                  </div>
                  <div className="text-5xl sm:text-6xl font-black mb-4">
                    <span className="text-gradient-animate">
                      {formatCurrency(totalCostLocal, currency)}
                    </span>
                  </div>
                  
                  {currency !== 'USD' && (
                    <div className="text-sm text-text-secondary">
                      ≈ {formatCurrency(totalCostUSD, 'USD')}
                    </div>
                  )}
                  
                  <div className="mt-8 space-y-3 text-sm">
                    <div className="glass-card rounded-xl p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-text-muted">Per Video ({duration}s)</span>
                        <span className="font-bold text-white">
                          {formatCurrency(costPerVideo * exchangeRates[currency], currency)}
                        </span>
                      </div>
                    </div>
                    <div className="glass-card rounded-xl p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-text-muted">Per Second</span>
                        <span className="font-bold text-white">
                          {formatCurrency(selectedPricing.pricePerSecond * exchangeRates[currency], currency)}
                        </span>
                      </div>
                    </div>
                    <div className="glass-card rounded-xl p-4 bg-accent-primary/10">
                      <div className="flex justify-between items-center">
                        <span className="text-text-muted">Total Videos</span>
                        <span className="font-bold text-accent-primary">
                          {videoCount} × {duration}s = {videoCount * duration}s
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Direct API Pricing Note */}
                  <div className="mt-6 p-4 bg-success/10 border border-success/30 rounded-xl">
                    <div className="flex items-center justify-center gap-2 text-success">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-semibold">
                        {t('calculator.directPricing')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Info Cards */}
      <ScrollReveal delay={0.3}>
        <div className="grid md:grid-cols-3 gap-6 mt-10">
          <div className="glass-card rounded-2xl p-6 hover-lift">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-accent-primary/20 rounded-lg">
                <svg className="w-5 h-5 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-white">{t('calculator.payAsYouGo.title')}</h3>
            </div>
            <p className="text-sm text-text-secondary">
              {t('calculator.payAsYouGo.desc')}
            </p>
          </div>
          
          <div className="glass-card rounded-2xl p-6 hover-lift">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-accent-secondary/20 rounded-lg">
                <svg className="w-5 h-5 text-accent-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-bold text-white">{t('calculator.realTimeRates.title')}</h3>
            </div>
            <p className="text-sm text-text-secondary">
              {t('calculator.realTimeRates.desc')}
            </p>
          </div>
          
          <div className="glass-card rounded-2xl p-6 hover-lift">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-success/20 rounded-lg">
                <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-white">{t('calculator.noMarkup.title')}</h3>
            </div>
            <p className="text-sm text-text-secondary">
              {t('calculator.noMarkup.desc')}
            </p>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}

<style>{`
  .slider-premium {
    -webkit-appearance: none;
    appearance: none;
    outline: none;
    height: 12px;
    border-radius: 9999px;
    cursor: pointer;
  }
  
  .slider-premium::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: linear-gradient(135deg, #00d4ff, #8b5cf6);
    cursor: pointer;
    box-shadow: 0 2px 10px rgba(0, 212, 255, 0.4);
    transition: all 0.2s;
  }
  
  .slider-premium::-webkit-slider-thumb:hover {
    transform: scale(1.2);
    box-shadow: 0 4px 20px rgba(139, 92, 246, 0.5);
  }
  
  .slider-premium::-moz-range-thumb {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: linear-gradient(135deg, #00d4ff, #8b5cf6);
    cursor: pointer;
    box-shadow: 0 2px 10px rgba(0, 212, 255, 0.4);
    transition: all 0.2s;
    border: none;
  }
  
  .slider-premium::-moz-range-thumb:hover {
    transform: scale(1.2);
    box-shadow: 0 4px 20px rgba(139, 92, 246, 0.5);
  }
`}</style>
