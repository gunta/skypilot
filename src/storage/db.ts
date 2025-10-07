import { mkdir } from 'node:fs/promises';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { homedir } from 'node:os';

import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';

const HOME_OVERRIDE = process.env.SKYPILOT_HOME;
const APP_DIR = HOME_OVERRIDE ? path.resolve(HOME_OVERRIDE) : path.join(homedir(), '.skypilot');
const DB_FILENAME = 'settings.db';
const DB_PATH = path.join(APP_DIR, DB_FILENAME);

if (!existsSync(APP_DIR)) {
  mkdirSync(APP_DIR, { recursive: true });
}

const client = createClient({ url: `file:${DB_PATH}` });
export const db = drizzle(client);
export const rawClient = client;

let initPromise: Promise<void> | null = null;
let initialized = false;

const createTables = async () => {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS exchange_rates (
      base TEXT PRIMARY KEY,
      rates TEXT NOT NULL,
      fetched_at INTEGER NOT NULL
    );
  `);
};

export const ensureDatabase = async () => {
  if (initialized) {
    return;
  }

  if (!initPromise) {
    initPromise = (async () => {
      if (!existsSync(APP_DIR)) {
        await mkdir(APP_DIR, { recursive: true });
      }

      await createTables();
      initialized = true;
    })().finally(() => {
      initPromise = null;
    });
  }

  await initPromise;
};

export const paths = {
  appDir: APP_DIR,
  dbPath: DB_PATH,
};
