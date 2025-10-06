import { setLocale as runtimeSetLocale, getLocale as runtimeGetLocale, locales } from './paraglide/runtime';
import { getLanguage as loadLanguage, setLanguage as persistLanguage, getDefaultLanguage } from './config/settings';

export type Locale = (typeof locales)[number];
const supported = new Set<Locale>(locales as readonly Locale[]);

const normalizeLocale = (value: string | null | undefined): Locale => {
  const fallback = getDefaultLanguage();
  if (!value) {
    return fallback;
  }

  const candidate = value.trim().toLowerCase();
  if (!candidate) {
    return fallback;
  }

  if (supported.has(candidate as Locale)) {
    return candidate as Locale;
  }

  const short = candidate.split('-')[0];
  if (supported.has(short as Locale)) {
    return short as Locale;
  }

  return fallback;
};

export const initializeI18n = async (): Promise<Locale> => {
  const stored = await loadLanguage();
  const locale = normalizeLocale(stored);
  await setLocaleInternal(locale);
  return locale;
};

const setLocaleInternal = async (locale: Locale) => {
  const result = runtimeSetLocale(locale, { reload: false });
  if (result instanceof Promise) {
    await result;
  }
};

export const changeLanguage = async (language: string): Promise<Locale> => {
  const normalized = normalizeLocale(language);
  await persistLanguage(normalized);
  await setLocaleInternal(normalized);
  return normalized;
};

export const cycleLanguage = async (): Promise<Locale> => {
  const current = runtimeGetLocale();
  const index = locales.indexOf(current as Locale);
  const next = locales[(index + 1) % locales.length] as Locale;
  await persistLanguage(next);
  await setLocaleInternal(next);
  return next;
};

export const getActiveLocale = (): Locale => runtimeGetLocale() as Locale;

export const getSupportedLocales = (): readonly Locale[] => locales;
