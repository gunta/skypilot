import { m } from '../paraglide/messages.js';

export type MessageKey = keyof typeof m;

export type TranslateFn = <K extends MessageKey>(
  key: K,
  params?: Parameters<(typeof m)[K]>[0],
) => string;

export const translate: TranslateFn = (key, params) =>
  (m[key] as (args?: Record<string, unknown>) => string)(params ?? {});
