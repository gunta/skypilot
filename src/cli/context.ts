import { spawn } from 'node:child_process';
import chalk from 'chalk';

import type { SoraVideo, VideoAssetVariant } from '../api.js';
import type { AssetChoice, DownloadedAssetsSummary } from '../assets.js';
import { translate } from '@/shared/translation.js';
import { formatVideoStatus, formatVideoTimestamp } from '@/shared/video.js';
import type { CurrencyFormatter } from '../currency.js';
import type { CostSummary } from '../pricing.js';
import { createSoraManagerController } from '../state/manager.js';

export const API_KEY_URL = 'https://platform.openai.com/account/api-keys';

export const manager = createSoraManagerController();

const openInBrowser = async (url: string) =>
  new Promise<void>((resolve, reject) => {
    const platform = process.platform;
    let command: string;
    let args: string[];

    if (platform === 'darwin') {
      command = 'open';
      args = [url];
    } else if (platform === 'win32') {
      command = 'cmd';
      args = ['/c', 'start', '', url];
    } else {
      command = 'xdg-open';
      args = [url];
    }

    const child = spawn(command, args, { stdio: 'ignore', detached: true });

    let settled = false;

    child.on('error', (error) => {
      if (settled) {
        return;
      }
      settled = true;
      reject(error);
    });

    child.on('spawn', () => {
      if (settled) {
        return;
      }
      settled = true;
      child.unref();
      resolve();
    });
  });

export const ensureApiKey = async () => {
  if (process.env.OPENAI_API_KEY) {
    return;
  }

  console.error(chalk.red(translate('cli.message.apiKeyMissing')));
  console.log(chalk.yellow(translate('cli.message.openingApiKeys')));

  try {
    await openInBrowser(API_KEY_URL);
  } catch (error) {
    console.error(
      chalk.red(
        translate('cli.message.openBrowserFailed', {
          url: API_KEY_URL,
          message: (error as Error).message,
        }),
      ),
    );
  }

  process.exit(1);
};

export const VALID_STATUSES: readonly SoraVideo['status'][] = ['queued', 'in_progress', 'completed', 'failed'];

export const translateAssetVariant = (variant: AssetChoice | VideoAssetVariant) =>
  translate(`asset.variant.${variant}` as const);

export const renderDownloadSummary = (summary: DownloadedAssetsSummary) =>
  summary.entries
    .map(({ variant, path }) => `${translateAssetVariant(variant)} → ${path}`)
    .join('\n');

export const parseInteger = (value: string) => {
  const numeric = Number.parseInt(value, 10);
  if (Number.isNaN(numeric) || numeric <= 0) {
    throw new Error('Value must be a positive integer');
  }
  return numeric;
};

export const ensureCurrencyFormatterForCli = async (): Promise<CurrencyFormatter | null> => {
  const existing = manager.snapshot.context.currencyFormatter;
  if (existing) {
    return existing;
  }

  try {
    const result = await manager.loadCurrency();
    return result.formatter;
  } catch (error) {
    console.error(chalk.yellow(translate('cli.message.currencyError', { message: (error as Error).message })));
    return null;
  }
};

export const formatCostForLine = (costSummary: CostSummary | null) => {
  if (!costSummary) {
    return chalk.dim(translate('cli.message.costUnavailable'));
  }

  return translate('cli.message.costSingle', {
    currency: costSummary.preferredCurrency,
    amount: costSummary.estimatedDisplay.preferred,
  });
};

export const renderStatusLine = (video: SoraVideo, costSummary: CostSummary | null) => {
  const createdAt = formatVideoTimestamp(video.created_at);
  const parts = [
    chalk.bold(video.id),
    chalk.cyan(video.model),
    `${video.seconds}s`,
    video.size,
    formatVideoStatus(video.status),
    `${video.progress}%`,
    createdAt,
  ];

  if (costSummary) {
    parts.push(formatCostForLine(costSummary));
  } else {
    parts.push(chalk.dim(translate('cli.message.costUnavailable')));
  }

  return parts.join(' | ');
};

export interface CliContext {
  manager: typeof manager;
  ensureApiKey: typeof ensureApiKey;
  ensureCurrencyFormatter: typeof ensureCurrencyFormatterForCli;
  translate: typeof translate;
  translateAssetVariant: typeof translateAssetVariant;
  renderDownloadSummary: typeof renderDownloadSummary;
  renderStatusLine: typeof renderStatusLine;
  formatCostForLine: typeof formatCostForLine;
  parseInteger: typeof parseInteger;
  validStatuses: readonly SoraVideo['status'][];
}

export const cliContext: CliContext = {
  manager,
  ensureApiKey,
  ensureCurrencyFormatter: ensureCurrencyFormatterForCli,
  translate,
  translateAssetVariant,
  renderDownloadSummary,
  renderStatusLine,
  formatCostForLine,
  parseInteger,
  validStatuses: VALID_STATUSES,
};
