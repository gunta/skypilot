import { m } from '../paraglide/messages.js';

export type MessageKey = keyof typeof m;

export const translate = <K extends MessageKey>(
  key: K,
  params?: Parameters<(typeof m)[K]>[0],
) => (m[key] as (args?: Record<string, unknown>) => string)(params ?? {});

export type TranslateFn = typeof translate;
