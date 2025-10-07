const STORAGE_KEY = 'skypilot.language';
const DEFAULT_LOCALE = 'en';

const readStorage = (): string | null => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

const writeStorage = (value: string) => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Ignore storage failures; language will fall back to default.
  }
};

export const initializeI18n = async (): Promise<string> => {
  const stored = readStorage();
  const normalized = typeof stored === 'string' && stored.trim() !== '' ? stored : DEFAULT_LOCALE;
  writeStorage(normalized);
  return normalized;
};

export const changeLanguage = async (next: string): Promise<string> => {
  const normalized = next.trim() || DEFAULT_LOCALE;
  writeStorage(normalized);
  return normalized;
};
