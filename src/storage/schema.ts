import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: integer('updated_at', { mode: 'number' }).notNull(),
});

export const exchangeRates = sqliteTable('exchange_rates', {
  base: text('base').primaryKey(),
  rates: text('rates').notNull(),
  fetchedAt: integer('fetched_at', { mode: 'number' }).notNull(),
});
