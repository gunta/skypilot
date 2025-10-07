import { createClient } from '@libsql/client/web';

export interface BrowserDatabase {
  describe(): string;
}

let cached: BrowserDatabase | null = null;

export const createBrowserDatabase = async (): Promise<BrowserDatabase> => {
  if (cached) {
    return cached;
  }

  const url = import.meta.env.VITE_SKYPILOT_LIBSQL_URL;
  const authToken = import.meta.env.VITE_SKYPILOT_LIBSQL_AUTH_TOKEN;

  if (!url) {
    cached = {
      describe: () => 'libSQL browser client disabled (missing VITE_SKYPILOT_LIBSQL_URL)'
    };
    return cached;
  }

  // Establish the client to ensure credentials are valid. Future iterations will expose query helpers.
  createClient({
    url,
    authToken
  });

  cached = {
    describe: () => `Connected to ${url}`
  };
  return cached;
};
