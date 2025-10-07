import { eq } from 'drizzle-orm';

import { db, ensureDatabase } from '../storage/db.js';
import { settings } from '../storage/schema.js';
import { detectPreferredCurrency, detectLocale } from '../locale/detect.js';
import { locales as supportedLocales, baseLocale } from '../paraglide/runtime.js';

const DEFAULT_CURRENCY = 'USD';
type SupportedLocale = (typeof supportedLocales)[number];

const DEFAULT_LANGUAGE: SupportedLocale = baseLocale as SupportedLocale;
const LANGUAGE_KEY = 'language';

const supportedLanguageSet = new Set<SupportedLocale>(supportedLocales);

const normalizeLanguage = (language: string | null | undefined): SupportedLocale | null => {
  if (!language) {
    return null;
  }
  const cleaned = language.trim().toLowerCase();
  if (!cleaned) {
    return null;
  }
  if (supportedLanguageSet.has(cleaned as SupportedLocale)) {
    return cleaned as SupportedLocale;
  }
  const short = cleaned.split('-')[0];
  if (supportedLanguageSet.has(short as SupportedLocale)) {
    return short as SupportedLocale;
  }
  return null;
};

export const getSetting = async (key: string): Promise<string | null> => {
  await ensureDatabase();
  const rows = await db.select().from(settings).where(eq(settings.key, key));
  const row = rows[0];
  return row?.value ?? null;
};

export const setSetting = async (key: string, value: string): Promise<void> => {
  await ensureDatabase();
  const timestamp = Date.now();
  await db
    .insert(settings)
    .values({ key, value, updatedAt: timestamp })
    .onConflictDoUpdate({ target: settings.key, set: { value, updatedAt: timestamp } });
};

const CURRENCY_KEY = 'currency';

export const getCurrency = async (): Promise<string> => {
  const stored = await getSetting(CURRENCY_KEY);
  if (stored) {
    return stored;
  }

  const detected = detectPreferredCurrency();
  if (detected) {
    await setSetting(CURRENCY_KEY, detected);
    return detected;
  }

  return DEFAULT_CURRENCY;
};

export const setCurrency = async (currencyCode: string): Promise<void> => {
  const normalized = currencyCode.trim().toUpperCase();
  if (!normalized) {
    throw new Error('Currency code cannot be empty');
  }

  await setSetting(CURRENCY_KEY, normalized);
};

export const getDefaultCurrency = () => DEFAULT_CURRENCY;

export const getLanguage = async (): Promise<SupportedLocale> => {
  const stored = await getSetting(LANGUAGE_KEY);
  if (stored) {
    return normalizeLanguage(stored) ?? DEFAULT_LANGUAGE;
  }

  const detected = detectLocale();
  const normalized = normalizeLanguage(detected.locale);
  const fallback = normalized ?? DEFAULT_LANGUAGE;
  await setSetting(LANGUAGE_KEY, fallback);
  return fallback;
};

export const setLanguage = async (languageCode: string): Promise<void> => {
  const normalized = normalizeLanguage(languageCode);
  if (!normalized) {
    throw new Error(`Unsupported language: ${languageCode}`);
  }
  await setSetting(LANGUAGE_KEY, normalized);
};

export const getDefaultLanguage = (): SupportedLocale => DEFAULT_LANGUAGE;
