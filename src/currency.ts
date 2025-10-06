import { eq } from 'drizzle-orm';

import { getCurrency as getPreferredCurrency, getDefaultCurrency } from './config/settings';
import { db, ensureDatabase } from './storage/db';
import { exchangeRates } from './storage/schema';

const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 1 day

interface RatesRecord {
  base: string;
  rates: Record<string, number>;
  fetchedAt: number;
}

const inMemoryRates = new Map<string, RatesRecord>();

const parseRatesRow = (row: typeof exchangeRates.$inferSelect): RatesRecord => ({
  base: row.base,
  rates: JSON.parse(row.rates ?? '{}'),
  fetchedAt: row.fetchedAt,
});

const fetchRatesFromApi = async (base: string): Promise<RatesRecord> => {
  const response = await fetch(`https://open.er-api.com/v6/latest/${base.toUpperCase()}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch exchange rates: ${response.status} ${response.statusText}`);
  }
  const data = (await response.json()) as { rates?: Record<string, number>; time_last_update_unix?: number };
  if (!data.rates) {
    throw new Error('Unexpected currency API response');
  }

  const fetchedAt = (data.time_last_update_unix ?? Math.floor(Date.now() / 1000)) * 1000;
  return { base: base.toUpperCase(), rates: data.rates, fetchedAt };
};

const persistRates = async (record: RatesRecord) => {
  await ensureDatabase();
  await db
    .insert(exchangeRates)
    .values({ base: record.base, rates: JSON.stringify(record.rates), fetchedAt: record.fetchedAt })
    .onConflictDoUpdate({ target: exchangeRates.base, set: { rates: JSON.stringify(record.rates), fetchedAt: record.fetchedAt } });
};

const loadRatesFromDb = async (base: string): Promise<RatesRecord | null> => {
  await ensureDatabase();
  const rows = await db.select().from(exchangeRates).where(eq(exchangeRates.base, base.toUpperCase()));
  const row = rows[0];
  if (!row) {
    return null;
  }
  return parseRatesRow(row);
};

export const getExchangeRates = async (base: string = 'USD'): Promise<RatesRecord> => {
  const normalizedBase = base.toUpperCase();
  const now = Date.now();

  const cached = inMemoryRates.get(normalizedBase);
  if (cached && now - cached.fetchedAt < CACHE_DURATION_MS) {
    return cached;
  }

  const stored = await loadRatesFromDb(normalizedBase);
  if (stored && now - stored.fetchedAt < CACHE_DURATION_MS) {
    inMemoryRates.set(normalizedBase, stored);
    return stored;
  }

  try {
    const fresh = await fetchRatesFromApi(normalizedBase);
    inMemoryRates.set(normalizedBase, fresh);
    await persistRates(fresh);
    return fresh;
  } catch (error) {
    if (stored) {
      // Fallback to stale data if available.
      return stored;
    }
    throw error;
  }
};

export interface CurrencyFormatter {
  currency: string;
  rate: number;
  convert(amountUsd: number): number;
  format(amountUsd: number): string;
}

export const getCurrencyFormatter = async (): Promise<CurrencyFormatter> => {
  const preferredCurrency = (await getPreferredCurrency()).toUpperCase();
  const baseCurrency = 'USD';

  if (preferredCurrency === baseCurrency) {
    const formatter = new Intl.NumberFormat(undefined, { style: 'currency', currency: baseCurrency });
    return {
      currency: baseCurrency,
      rate: 1,
      convert: (amountUsd) => amountUsd,
      format: (amountUsd) => formatter.format(amountUsd),
    };
  }

  const rates = await getExchangeRates(baseCurrency);
  const rate = rates.rates[preferredCurrency];

  if (typeof rate !== 'number') {
    const fallbackCurrency = getDefaultCurrency();
    const formatter = new Intl.NumberFormat(undefined, { style: 'currency', currency: fallbackCurrency });
    return {
      currency: fallbackCurrency,
      rate: 1,
      convert: (amountUsd) => amountUsd,
      format: (amountUsd) => formatter.format(amountUsd),
    };
  }

  let formatter: Intl.NumberFormat;
  try {
    formatter = new Intl.NumberFormat(undefined, { style: 'currency', currency: preferredCurrency });
  } catch (error) {
    const fallbackCurrency = getDefaultCurrency();
    const fallbackFormatter = new Intl.NumberFormat(undefined, { style: 'currency', currency: fallbackCurrency });
    return {
      currency: fallbackCurrency,
      rate: 1,
      convert: (amountUsd) => amountUsd,
      format: (amountUsd) => fallbackFormatter.format(amountUsd),
    };
  }

  return {
    currency: preferredCurrency,
    rate,
    convert: (amountUsd) => amountUsd * rate,
    format: (amountUsd) => formatter.format(amountUsd * rate),
  };
};

export const formatUsd = (amountUsd: number) => new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(amountUsd);
