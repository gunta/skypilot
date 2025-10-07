/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SKYPILOT_LIBSQL_URL?: string;
  readonly VITE_SKYPILOT_LIBSQL_AUTH_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
