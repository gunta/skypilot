#!/usr/bin/env node

import { createReadStream, existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { Command, Option } from 'commander';
import chalk from 'chalk';
import { spawn } from 'node:child_process';
import { toFile } from 'openai/uploads';

import { retrieveVideo, type SoraVideo, type VideoAssetVariant } from './api.js';
import { getCurrency, setCurrency } from './config/settings.js';
import { getCurrencyFormatter, getExchangeRates, type CurrencyFormatter } from './currency.js';
import { detectLocale } from './locale/detect.js';
import { initializeI18n, changeLanguage, cycleLanguage, getActiveLocale, getSupportedLocales } from './i18n.js';
import { m } from './paraglide/messages.js';
import { buildCostSummary, calculateVideoCost, type CostSummary } from './pricing.js';
import {
  ASSET_CHOICES,
  downloadAssetsForChoice,
  type AssetChoice,
  type DownloadedAssetsSummary,
} from './assets.js';
import { exportVideosToCsv } from './export/csv.js';
import { createSoraManagerController } from './state/manager.js';

await initializeI18n();

const translate = <K extends keyof typeof m>(key: K, params?: Parameters<(typeof m)[K]>[0]) =>
  (m[key] as (args?: Record<string, unknown>) => string)(params ?? {});

const API_KEY_URL = 'https://platform.openai.com/account/api-keys';

const manager = createSoraManagerController();

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

const ensureApiKey = async () => {
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

const VALID_STATUSES: SoraVideo['status'][] = ['queued', 'in_progress', 'completed', 'failed'];

const translateAssetVariant = (variant: AssetChoice | VideoAssetVariant) =>
  translate(`asset.variant.${variant}` as keyof typeof m);

const renderDownloadSummary = (summary: DownloadedAssetsSummary) =>
  summary.entries
    .map(({ variant, path }) => `${translateAssetVariant(variant)} → ${path}`)
    .join('\n');

const parseInteger = (value: string) => {
  const numeric = Number.parseInt(value, 10);
  if (Number.isNaN(numeric) || numeric <= 0) {
    throw new Error('Value must be a positive integer');
  }
  return numeric;
};

const ensureCurrencyFormatterForCli = async (): Promise<CurrencyFormatter | null> => {
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

const formatCostForLine = (costSummary: CostSummary | null) => {
  if (!costSummary) {
    return chalk.dim(translate('cli.message.costUnavailable'));
  }

  return translate('cli.message.costSingle', {
    currency: costSummary.preferredCurrency,
    amount: costSummary.estimatedDisplay.preferred,
  });
};

const formatStatus = (status: SoraVideo['status']) => translate(`status.${status}` as keyof typeof m);

const renderStatusLine = (video: SoraVideo, costSummary: CostSummary | null) => {
  const createdAt = new Date(video.created_at * 1000).toLocaleString();
  const parts = [
    chalk.bold(video.id),
    chalk.cyan(video.model),
    `${video.seconds}s`,
    video.size,
    formatStatus(video.status),
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

export const program = new Command();

program
  .name('skypilot')
  .description(translate('cli.programDescription'));

program
  .command('list')
  .description(translate('cli.command.list.description'))
  .addOption(new Option('-s, --status <status...>', translate('cli.option.status')).choices(VALID_STATUSES))
  .option('-l, --limit <number>', translate('cli.option.limit'), parseInteger, 20)
  .addOption(
    new Option('--order <order>', translate('cli.option.order')).choices(['asc', 'desc']).default('desc'),
  )
  .action(async ({ status, limit, order }: { status?: SoraVideo['status'][]; limit: number; order: 'asc' | 'desc' }) => {
    await ensureApiKey();
    try {
      const result = await manager.refresh({ limit, order });
      const filtered = status?.length ? result.videos.filter((video) => status.includes(video.status)) : result.videos;

      if (!filtered.length) {
        console.log(chalk.dim(translate('cli.message.noVideos')));
        return;
      }

      const summaries = manager.snapshot.context.costSummaries;

      for (const video of filtered) {
        const costSummary = summaries[video.id] ?? null;
        const line = renderStatusLine(video, costSummary);
        console.log(line);
      }
    } catch (error) {
      console.error(chalk.red(translate('activity.error', { message: (error as Error).message })));
      process.exitCode = 1;
    }
  });

program
  .command('export')
  .description(translate('cli.command.export.description'))
  .addOption(new Option('-s, --status <status...>', translate('cli.option.status')).choices(VALID_STATUSES))
  .option('-l, --limit <number>', translate('cli.option.limit'), parseInteger, 100)
  .addOption(
    new Option('--order <order>', translate('cli.option.order')).choices(['asc', 'desc']).default('desc'),
  )
  .option('-o, --output <path>', translate('cli.option.output'))
  .action(
    async ({
      status,
      limit,
      order,
      output,
    }: {
      status?: SoraVideo['status'][];
      limit: number;
      order: 'asc' | 'desc';
      output?: string;
    }) => {
      await ensureApiKey();
      const currencyFormatter = await ensureCurrencyFormatterForCli();

      try {
        const result = await manager.refresh({ limit, order });
        const filtered = status?.length ? result.videos.filter((video) => status.includes(video.status)) : result.videos;

        if (!filtered.length) {
          console.log(chalk.dim(translate('cli.message.noVideos')));
          return;
        }

        const exportPath = await exportVideosToCsv(
          filtered,
          manager.snapshot.context.costSummaries,
          translate,
          currencyFormatter,
          output,
        );

        console.log(chalk.green(translate('cli.message.exportedCsv', { path: exportPath })));
      } catch (error) {
        console.error(chalk.red(translate('cli.message.exportFailed', { message: (error as Error).message })));
        process.exitCode = 1;
      }
    },
  );

program
  .command('retrieve')
  .description(translate('cli.command.retrieve.description'))
  .argument('<videoId>', translate('cli.argument.videoId'))
  .option('--json', translate('cli.option.json'), false)
  .action(async (videoId: string, options: { json?: boolean }) => {
    await ensureApiKey();
    const video = await retrieveVideo(videoId);
    if (options.json) {
      console.log(JSON.stringify(video, null, 2));
      return;
    }

    const formatter = await ensureCurrencyFormatterForCli();
    const breakdown = calculateVideoCost(video);
    const costSummary = breakdown && formatter ? buildCostSummary(breakdown, formatter) : null;

    console.log(renderStatusLine(video, costSummary));
    if (video.status === 'failed' && video.error) {
      console.log(chalk.red(translate('activity.error', { message: `${video.error.code} — ${video.error.message}` })));
    }

    if (!costSummary) {
      console.log(translate('cli.message.costUnavailable'));
    }
  });

program
  .command('delete')
  .description(translate('cli.command.delete.description'))
  .argument('<videoId>', translate('cli.argument.videoId'))
  .option('--json', translate('cli.option.json'), false)
  .action(async (videoId: string, options: { json?: boolean }) => {
    await ensureApiKey();
    try {
      const result = await manager.delete({ videoId });
      if (options.json) {
        console.log(
          JSON.stringify(
            {
              id: result.responseId,
              deleted: result.deleted,
            },
            null,
            2,
          ),
        );
        return;
      }

      if (result.deleted) {
        console.log(chalk.green(translate('cli.message.deleteSuccess', { id: result.responseId })));
      } else {
        console.log(chalk.yellow(translate('cli.message.deleteNotConfirmed', { id: result.responseId })));
      }
    } catch (error) {
      console.error(
        chalk.red(
          translate('cli.message.deleteFailed', {
            id: videoId,
            message: (error as Error).message,
          }),
        ),
      );
      process.exitCode = 1;
    }
  });


program
  .command('create')
  .description(translate('cli.command.create.description'))
  .requiredOption('-p, --prompt <prompt>', translate('cli.option.prompt'))
  .addOption(new Option('-m, --model <model>', translate('cli.option.model')).choices(['sora-2', 'sora-2-pro']).default('sora-2'))
  .addOption(new Option('--seconds <seconds>', translate('cli.option.seconds')).choices(['4', '8', '12']))
  .addOption(
    new Option('--size <size>', translate('cli.option.size'))
      .choices(['720x1280', '1280x720', '1024x1792', '1792x1024'])
      .default('720x1280'),
  )
  .option('--input-reference <path>', translate('cli.option.inputReference'))
  .option('--watch', translate('cli.option.watch'), false)
  .option('--poll-interval <ms>', translate('cli.option.pollInterval'), parseInteger, 3000)
  .option('--download [path]', translate('cli.option.download'))
  .addOption(
    new Option('--download-asset <variant>', translate('cli.option.downloadAsset'))
      .choices([...ASSET_CHOICES])
      .default('video_and_thumbnail'),
  )
  .option('--no-auto-download', translate('cli.option.autoDownload'))
  .option('--no-sound', translate('cli.option.sound'))
  .option('--json', translate('cli.option.jsonCreate'), false)
  .action(
    async (
      options: {
        prompt: string;
        model: SoraVideo['model'];
        seconds?: SoraVideo['seconds'];
        size: SoraVideo['size'];
        inputReference?: string;
        watch?: boolean;
        pollInterval?: number;
        download?: string | boolean;
        downloadAsset: AssetChoice;
        json?: boolean;
        autoDownload?: boolean;
        sound?: boolean;
      },
    ) => {
      await ensureApiKey();
      const {
        prompt,
        model,
        seconds,
        size,
        inputReference,
        watch,
        pollInterval,
        download,
        downloadAsset,
        json,
        autoDownload = true,
        sound = true,
      } = options;

      let inputReferenceUpload: Awaited<ReturnType<typeof toFile>> | undefined;
      if (inputReference) {
        const resolved = path.resolve(inputReference);
        if (!existsSync(resolved)) {
          throw new Error(`Input reference not found at ${resolved}`);
        }
        const stream = createReadStream(resolved);
        inputReferenceUpload = await toFile(stream, path.basename(resolved));
      }

      const explicitDownload =
        download !== undefined
          ? {
              choice: downloadAsset,
              destination: typeof download === 'string' ? download : undefined,
            }
          : undefined;

      const formatter = await ensureCurrencyFormatterForCli();

      let lastRendered = '';
      let initialVideo: SoraVideo | null = null;

      const onProgress = (video: SoraVideo) => {
        if (!initialVideo) {
          initialVideo = video;
          if (json) {
            console.log(JSON.stringify(video, null, 2));
          } else {
            const breakdown = calculateVideoCost(video);
            const initialSummary = formatter && breakdown ? buildCostSummary(breakdown, formatter) : null;
            console.log(chalk.green(translate('cli.message.videoCreated', { id: video.id })));
            console.log(renderStatusLine(video, initialSummary));
            if (!initialSummary) {
              console.log(translate('cli.message.costUnavailable'));
            }
          }
          return;
        }

        if (!watch) {
          return;
        }

        const line = translate('cli.message.progressLine', {
          status: formatStatus(video.status),
          progress: video.progress.toFixed(0).padStart(3),
        });
        if (line !== lastRendered) {
          process.stdout.write(`\r${line}`);
          lastRendered = line;
        }
      };

      const creationResult = await manager.create({
        prompt,
        model,
        seconds,
        size,
        watch,
        pollInterval,
        autoDownload,
        playSound: sound,
        download: explicitDownload,
        inputReference: inputReferenceUpload,
        onProgress,
      });

      if (!watch) {
        return;
      }

      if (lastRendered) {
        process.stdout.write('\n');
      }

      const finalVideo = creationResult.final;
      if (!finalVideo) {
        return;
      }

      if (finalVideo.status === 'failed') {
        const message = finalVideo.error?.message ?? translate('cli.message.unknownFailure');
        console.error(chalk.red(translate('cli.message.generationFailed', { message })));
        return;
      }

      console.log(chalk.green(translate('cli.message.generationCompleted', { id: finalVideo.id })));

      let finalSummary = manager.snapshot.context.costSummaries[finalVideo.id] ?? null;
      if (!finalSummary) {
        const formatterFallback = await ensureCurrencyFormatterForCli();
        const breakdown = calculateVideoCost(finalVideo);
        finalSummary = formatterFallback && breakdown ? buildCostSummary(breakdown, formatterFallback) : null;
      }
      if (finalSummary) {
        console.log(
          translate('cli.message.costSingle', {
            currency: finalSummary.preferredCurrency,
            amount: finalSummary.estimatedDisplay.preferred,
          }),
        );
      } else {
        console.log(translate('cli.message.costUnavailable'));
      }

      const downloadsSummary = creationResult.downloads;
      if (downloadsSummary && downloadsSummary.entries.length) {
        if (downloadsSummary.entries.length === 1) {
          const entry = downloadsSummary.entries[0]!;
          console.log(
            chalk.green(
              translate('cli.message.assetSaved', {
                path: entry.path,
                variant: translateAssetVariant(entry.variant),
              }),
            ),
          );
        } else {
          const summaryText = renderDownloadSummary(downloadsSummary);
          console.log(chalk.green(translate('cli.message.assetsSaved', { paths: summaryText })));
        }
      }
    },
  );


program
  .command('remix')
  .description(translate('cli.command.remix.description'))
  .argument('<videoId>', translate('cli.argument.videoId'))
  .requiredOption('-p, --prompt <prompt>', translate('cli.option.remixPrompt'))
  .option('--watch', translate('cli.option.watch'), false)
  .option('--poll-interval <ms>', translate('cli.option.pollInterval'), parseInteger, 3000)
  .option('--download [path]', translate('cli.option.download'))
  .addOption(
    new Option('--download-asset <variant>', translate('cli.option.downloadAsset'))
      .choices([...ASSET_CHOICES])
      .default('video_and_thumbnail'),
  )
  .option('--no-auto-download', translate('cli.option.autoDownload'))
  .option('--no-sound', translate('cli.option.sound'))
  .option('--json', translate('cli.option.jsonRemix'), false)
  .action(
    async (
      videoId: string,
      options: {
        prompt: string;
        watch?: boolean;
        pollInterval?: number;
        download?: string | boolean;
        downloadAsset: AssetChoice;
        json?: boolean;
        autoDownload?: boolean;
        sound?: boolean;
      },
    ) => {
      await ensureApiKey();
      const {
        prompt,
        watch,
        pollInterval = 3000,
        download,
        downloadAsset,
        json,
        autoDownload = true,
        sound = true,
      } = options;

      const explicitDownload =
        download !== undefined
          ? {
              choice: downloadAsset,
              destination: typeof download === 'string' ? download : undefined,
            }
          : undefined;

      const formatter = await ensureCurrencyFormatterForCli();

      let lastRendered = '';
      let initialVideo: SoraVideo | null = null;

      const onProgress = (video: SoraVideo) => {
        if (!initialVideo) {
          initialVideo = video;
          if (json) {
            console.log(JSON.stringify(video, null, 2));
          } else {
            const breakdown = calculateVideoCost(video);
            const initialSummary = formatter && breakdown ? buildCostSummary(breakdown, formatter) : null;
            console.log(
              chalk.green(
                translate('cli.message.remixQueued', {
                  id: video.id,
                  source: video.remixed_from_video_id ?? videoId,
                }),
              ),
            );
            console.log(renderStatusLine(video, initialSummary));
            if (!initialSummary) {
              console.log(translate('cli.message.costUnavailable'));
            }
          }
          return;
        }

        if (!watch) {
          return;
        }

        const line = translate('cli.message.progressLine', {
          status: formatStatus(video.status),
          progress: video.progress.toFixed(0).padStart(3),
        });
        if (line !== lastRendered) {
          process.stdout.write(`\r${line}`);
          lastRendered = line;
        }
      };

      const remixResult = await manager.remix({
        videoId,
        prompt,
        watch,
        pollInterval,
        autoDownload,
        playSound: sound,
        download: explicitDownload,
        onProgress,
      });

      if (!watch) {
        return;
      }

      if (lastRendered) {
        process.stdout.write('\n');
      }

      const finalVideo = remixResult.final;
      if (!finalVideo) {
        return;
      }

      if (finalVideo.status === 'failed') {
        const message = finalVideo.error?.message ?? translate('cli.message.unknownFailure');
        console.error(chalk.red(translate('cli.message.generationFailed', { message })));
        return;
      }

      console.log(chalk.green(translate('cli.message.remixCompleted', { id: finalVideo.id })));

      let finalSummary = manager.snapshot.context.costSummaries[finalVideo.id] ?? null;
      if (!finalSummary) {
        const formatterFallback = await ensureCurrencyFormatterForCli();
        const breakdown = calculateVideoCost(finalVideo);
        finalSummary = formatterFallback && breakdown ? buildCostSummary(breakdown, formatterFallback) : null;
      }
      if (finalSummary) {
        console.log(
          translate('cli.message.costSingle', {
            currency: finalSummary.preferredCurrency,
            amount: finalSummary.estimatedDisplay.preferred,
          }),
        );
      } else {
        console.log(translate('cli.message.costUnavailable'));
      }

      const downloadsSummary = remixResult.downloads;
      if (downloadsSummary && downloadsSummary.entries.length) {
        if (downloadsSummary.entries.length === 1) {
          const entry = downloadsSummary.entries[0]!;
          console.log(
            chalk.green(
              translate('cli.message.assetSaved', {
                path: entry.path,
                variant: translateAssetVariant(entry.variant),
              }),
            ),
          );
        } else {
          const summaryText = renderDownloadSummary(downloadsSummary);
          console.log(chalk.green(translate('cli.message.assetsSaved', { paths: summaryText })));
        }
      }
    },
  );


program
  .command('download')
  .description(translate('cli.command.download.description'))
  .argument('<videoId>', translate('cli.argument.videoId'))
  .option('-o, --output <path>', translate('cli.option.output'))
  .addOption(
    new Option('-a, --asset <variant>', translate('cli.option.asset'))
      .choices([...ASSET_CHOICES])
      .default('video_and_thumbnail'),
  )
  .action(async (videoId: string, { output, asset }: { output?: string; asset: AssetChoice }) => {
    await ensureApiKey();
    try {
      const result = await manager.download({
        videoId,
        choice: asset,
        destination: output,
      });
      const downloads = result.downloads;
      if (downloads.entries.length === 1) {
        const entry = downloads.entries[0]!;
        console.log(
          chalk.green(
            translate('cli.message.assetSavedWithId', {
              id: videoId,
              path: entry.path,
              variant: translateAssetVariant(entry.variant),
            }),
          ),
        );
        return;
      }

      const summary = renderDownloadSummary(downloads);
      console.log(
        chalk.green(
          translate('cli.message.assetsSavedWithId', {
            id: videoId,
            paths: summary,
          }),
        ),
      );
    } catch (error) {
      console.error(chalk.red(translate('activity.error', { message: (error as Error).message })));
      process.exitCode = 1;
    }
  });


program
  .command('tui')
  .description(translate('cli.command.tui.description'))
  .option('--interval <ms>', translate('cli.option.pollIntervalTui'), parseInteger, 5000)
  .option('--no-auto-download', translate('cli.option.autoDownload'))
  .option('--no-sound', translate('cli.option.sound'))
  .action(async ({ interval, autoDownload = true, sound = true }: { interval: number; autoDownload?: boolean; sound?: boolean }) => {
    await ensureApiKey();
    const { render } = await import('ink');
    const React = await import('react');
    const { default: App } = await import('./tui/App.js');

    render(React.createElement(App, { pollInterval: interval, autoDownload, playSound: sound }));
  });

program
  .command('currency')
  .description(translate('cli.command.currency.description'))
  .argument('[code]', translate('cli.command.currency.argument'))
  .action(async (code?: string) => {
    if (!code) {
      const current = await getCurrency();
      const formatter = await getCurrencyFormatter();
      console.log(translate('cli.message.currencyCurrent', { currency: current }));
      console.log(translate('cli.message.currencyExample', { example: formatter.format(1) }));
      const detected = detectLocale();
      if (detected.currency || detected.locale || detected.region) {
        console.log(
          translate('cli.message.currencyDetected', {
            locale: detected.locale ?? 'unknown',
            region: detected.region ?? 'unknown',
            currency: detected.currency ?? 'unknown',
          }),
        );
      }
      return;
    }

    const normalized = code.trim().toUpperCase();

    if (!/^[A-Z]{3}$/.test(normalized)) {
      console.error(chalk.red(translate('cli.message.currencyCodeInvalid')));
      return;
    }

    if (normalized !== 'USD') {
      try {
        const rates = await getExchangeRates('USD');
        if (typeof rates.rates[normalized] !== 'number') {
          console.error(chalk.red(translate('cli.message.currencyRateMissing', { currency: normalized })));
          return;
        }
      } catch (error) {
        console.error(chalk.red(translate('cli.message.currencyError', { message: (error as Error).message })));
        return;
      }
    }

    await setCurrency(normalized);

    const formatter = await getCurrencyFormatter();
    if (formatter.currency !== normalized) {
      console.log(
        chalk.yellow(
          translate('cli.message.currencyFallback', { requested: normalized, actual: formatter.currency }),
        ),
      );
    }
    console.log(translate('cli.message.currencySet', { currency: formatter.currency }));
    console.log(translate('cli.message.currencyExample', { example: formatter.format(1) }));
  });

program
  .command('language')
  .description(translate('cli.command.language.description'))
  .argument('[code]', translate('cli.command.language.argument'))
  .action(async (code?: string) => {
    const supported = getSupportedLocales();
    const supportedList = supported.join(', ');

    if (!code) {
      const current = getActiveLocale();
      console.log(translate('cli.message.languageCurrent', { language: current }));
      console.log(translate('cli.message.languageSupported', { languages: supportedList }));
      return;
    }

    const normalizedInput = code.trim().toLowerCase();
    let finalLocale: string;

    if (normalizedInput === 'next') {
      finalLocale = await cycleLanguage();
    } else if (supported.includes(normalizedInput as any)) {
      finalLocale = await changeLanguage(normalizedInput);
    } else {
      console.error(
        chalk.red(
          translate('cli.message.languageInvalid', {
            language: normalizedInput,
            languages: supportedList,
          }),
        ),
      );
      return;
    }

    console.log(translate('cli.message.languageSet', { language: finalLocale }));
  });

export const runCli = (argv: string[] = process.argv) => {
  const args = [...argv];

  if (args.length <= 2) {
    args.push('tui');
  }

  return program.parseAsync(args);
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  void runCli(process.argv);
}
