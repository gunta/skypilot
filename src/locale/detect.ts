import { REGION_TO_CURRENCY } from './regionCurrency.js';

export interface DetectedLocale {
  locale: string | null;
  region: string | null;
  currency: string | null;
  sources: string[];
}

const getGlobal = (): typeof globalThis | undefined => {
  try {
    return globalThis;
  } catch {
    return undefined;
  }
};

const globalRef = getGlobal();
type NavigatorLike = {
  language?: string;
  languages?: string[];
  userLanguage?: string;
};

const navigatorRef = (globalRef as any)?.navigator as NavigatorLike | undefined;
const documentRef = (globalRef as any)?.document as unknown;

const isBrowser = !!navigatorRef && !!documentRef;
const isNode = typeof process !== 'undefined' && !!process.versions?.node;

const sanitizeLocale = (value: string | undefined | null): string | null => {
  if (!value) {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  return trimmed.replace(/_/g, '-');
};

const getLocalesFromNavigator = (): string[] => {
  if (!isBrowser || !navigatorRef) {
    return [];
  }

  const candidate: string[] = [];

  if (Array.isArray(navigatorRef.languages)) {
    for (const lang of navigatorRef.languages) {
      const sanitized = sanitizeLocale(lang);
      if (sanitized) {
        candidate.push(sanitized);
      }
    }
  }

  const navLanguage = sanitizeLocale(navigatorRef.language);
  if (navLanguage) {
    candidate.push(navLanguage);
  }

  const userLanguage = sanitizeLocale(navigatorRef.userLanguage);
  if (userLanguage) {
    candidate.push(userLanguage);
  }

  return candidate;
};

const ENV_LOCALE_KEYS = ['LC_ALL', 'LC_MESSAGES', 'LANG', 'LANGUAGE'] as const;

const getLocalesFromEnv = (): string[] => {
  if (!isNode) {
    return [];
  }

  const result: string[] = [];

  for (const key of ENV_LOCALE_KEYS) {
    const value = sanitizeLocale(process.env[key]);
    if (!value) {
      continue;
    }

    for (const part of value.split(':')) {
      const sanitized = sanitizeLocale(part);
      if (sanitized) {
        result.push(sanitized);
      }
    }
  }

  return result;
};

const getLocaleFromIntl = (): string[] => {
  try {
    const resolved = Intl.DateTimeFormat().resolvedOptions();
    const locale = sanitizeLocale(resolved.locale);
    return locale ? [locale] : [];
  } catch {
    return [];
  }
};

const unique = <T,>(values: T[]): T[] => {
  const seen = new Set<T>();
  const output: T[] = [];
  for (const value of values) {
    if (!seen.has(value)) {
      seen.add(value);
      output.push(value);
    }
  }
  return output;
};

const determineRegion = (locale: string | null): string | null => {
  if (!locale) {
    return null;
  }

  try {
    const intlLocale = new Intl.Locale(locale);
    const maximized = intlLocale.maximize();
    if (maximized.region) {
      return maximized.region.toUpperCase();
    }
    if (intlLocale.region) {
      return intlLocale.region.toUpperCase();
    }
  } catch {
    // Ignore parsing errors
  }

  const parts = locale.split(/[-_]/);
  if (parts.length >= 2) {
    const potentialRegion = parts[1];
    if (potentialRegion && potentialRegion.length === 2) {
      return potentialRegion.toUpperCase();
    }
  }

  return null;
};

const determineCurrency = (region: string | null): string | null => {
  if (!region) {
    return null;
  }
  const currency = REGION_TO_CURRENCY[region.toUpperCase()];
  return currency ?? null;
};

export const detectLocale = (): DetectedLocale => {
  const navigatorLocales = getLocalesFromNavigator();
  const envLocales = getLocalesFromEnv();
  const intlLocales = getLocaleFromIntl();

  const localeCandidates = unique([...navigatorLocales, ...envLocales, ...intlLocales]);

  const sources: string[] = [];
  let locale: string | null = null;

  if (localeCandidates.length > 0) {
    const candidate = localeCandidates[0];
    if (candidate) {
      locale = candidate;
    }
    if (candidate && navigatorLocales.includes(candidate)) {
      sources.push('navigator');
    } else if (candidate && envLocales.includes(candidate)) {
      sources.push('env');
    } else if (candidate && intlLocales.includes(candidate)) {
      sources.push('intl');
    }
  }

  const region = determineRegion(locale);
  if (region) {
    sources.push('region');
  }

  const currency = determineCurrency(region);
  if (currency) {
    sources.push('currency-map');
  }

  return {
    locale,
    region,
    currency,
    sources,
  };
};

export const detectPreferredCurrency = (): string | null => {
  const detected = detectLocale();
  return detected.currency;
};

export const detectCountryCode = (): string | null => detectLocale().region;
