#!/usr/bin/env node

import { createReadStream, existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { Command, Option } from 'commander';
import chalk from 'chalk';
import { spawn } from 'node:child_process';
import { toFile } from 'openai/uploads';

import { playSuccessSound } from './notify.js';

import {
  createVideo,
  downloadVideoAsset,
  downloadVideoAssets,
  listVideos,
  retrieveVideo,
  waitForVideoCompletion,
  type SoraVideo,
  type VideoAssetVariant,
  ALL_VIDEO_ASSET_VARIANTS,
  remixVideo,
} from './api.js';
import { getCurrency, setCurrency } from './config/settings.js';
import { getCurrencyFormatter, getExchangeRates } from './currency.js';
import { detectLocale } from './locale/detect.js';
import { initializeI18n, changeLanguage, cycleLanguage, getActiveLocale, getSupportedLocales } from './i18n.js';
import { m } from './paraglide/messages.js';
import { buildCostSummary, calculateVideoCost, type CostSummary } from './pricing.js';

await initializeI18n();

const translate = <K extends keyof typeof m>(key: K, params?: Parameters<(typeof m)[K]>[0]) =>
  (m[key] as (args?: Record<string, unknown>) => string)(params ?? {});

const API_KEY_URL = 'https://platform.openai.com/account/api-keys';

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

await ensureApiKey();

const VALID_STATUSES: SoraVideo['status'][] = ['queued', 'in_progress', 'completed', 'failed'];
const ASSET_CHOICES = [...ALL_VIDEO_ASSET_VARIANTS, 'all'] as const;

type AssetChoice = (typeof ASSET_CHOICES)[number];

const translateAssetVariant = (variant: AssetChoice) =>
  translate(`asset.variant.${variant}` as keyof typeof m);

interface AssetDownloadResult {
  variant: VideoAssetVariant;
  path: string;
}

const downloadAssetsForChoice = async (
  videoId: string,
  asset: AssetChoice,
  destination?: string,
): Promise<AssetDownloadResult[]> => {
  if (asset === 'all') {
    const saved = await downloadVideoAssets(videoId, ALL_VIDEO_ASSET_VARIANTS, { destination });
    return saved.map((path, index) => ({
      variant: ALL_VIDEO_ASSET_VARIANTS[index]!,
      path,
    }));
  }

  const savedPath = await downloadVideoAsset(videoId, { destination, variant: asset });
  return [{ variant: asset, path: savedPath }];
};

const renderDownloadSummary = (downloads: AssetDownloadResult[]) =>
  downloads
    .map(({ variant, path }) => `${translateAssetVariant(variant)} → ${path}`)
    .join('\n');

const parseInteger = (value: string) => {
  const numeric = Number.parseInt(value, 10);
  if (Number.isNaN(numeric) || numeric <= 0) {
    throw new Error('Value must be a positive integer');
  }
  return numeric;
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
    const formatter = await getCurrencyFormatter();
    const videos = await listVideos({ limit, order });
    const filtered = status?.length ? videos.filter((video) => status.includes(video.status)) : videos;

    if (!filtered.length) {
      console.log(chalk.dim(translate('cli.message.noVideos')));
      return;
    }

    for (const video of filtered) {
      const breakdown = calculateVideoCost(video);
      const costSummary = breakdown ? buildCostSummary(breakdown, formatter) : null;
      const line = renderStatusLine(video, costSummary);
      console.log(line);
    }
  });

program
  .command('retrieve')
  .description(translate('cli.command.retrieve.description'))
  .argument('<videoId>', translate('cli.argument.videoId'))
  .option('--json', translate('cli.option.json'), false)
  .action(async (videoId: string, options: { json?: boolean }) => {
    const video = await retrieveVideo(videoId);
    if (options.json) {
      console.log(JSON.stringify(video, null, 2));
      return;
    }

    const formatter = await getCurrencyFormatter();
    const breakdown = calculateVideoCost(video);
    const costSummary = breakdown ? buildCostSummary(breakdown, formatter) : null;

    console.log(renderStatusLine(video, costSummary));
    if (video.status === 'failed' && video.error) {
      console.log(chalk.red(translate('activity.error', { message: `${video.error.code} — ${video.error.message}` })));
    }

    if (!costSummary) {
      console.log(translate('cli.message.costUnavailable'));
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
      .default('video'),
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

      const payload = await createVideo({ prompt, model, seconds, size, input_reference: inputReferenceUpload });
      const formatter = await getCurrencyFormatter();
      const initialBreakdown = calculateVideoCost(payload);
      const initialSummary = initialBreakdown ? buildCostSummary(initialBreakdown, formatter) : null;

      if (json) {
        console.log(JSON.stringify(payload, null, 2));
      } else {
        console.log(chalk.green(translate('cli.message.videoCreated', { id: payload.id })));
        console.log(renderStatusLine(payload, initialSummary));
        if (!initialSummary) {
          console.log(translate('cli.message.costUnavailable'));
        }
      }

      if (!watch) {
        return;
      }

      let lastRendered = '';
      const renderProgress = (video: SoraVideo) => {
        const line = translate('cli.message.progressLine', {
          status: formatStatus(video.status),
          progress: video.progress.toFixed(0).padStart(3),
        });
        if (line !== lastRendered) {
          process.stdout.write(`\r${line}`);
          lastRendered = line;
        }
      };

      const finalVideo = await waitForVideoCompletion(payload.id, {
        pollIntervalMs: pollInterval,
        onUpdate: renderProgress,
      });

      process.stdout.write('\n');

      if (finalVideo.status === 'failed') {
        const message = finalVideo.error?.message ?? translate('cli.message.unknownFailure');
        console.error(chalk.red(translate('cli.message.generationFailed', { message })));
        return;
      }

      console.log(chalk.green(translate('cli.message.generationCompleted', { id: finalVideo.id })));

      const finalBreakdown = calculateVideoCost(finalVideo);
      const finalSummary = finalBreakdown ? buildCostSummary(finalBreakdown, formatter) : null;
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

      if (download !== undefined) {
        const destination = typeof download === 'string' ? download : undefined;
        const downloads = await downloadAssetsForChoice(finalVideo.id, downloadAsset, destination);
        const summary = renderDownloadSummary(downloads);

        if (downloads.length === 1) {
          console.log(
            chalk.green(
              translate('cli.message.assetSaved', {
                path: downloads[0]!.path,
                variant: translateAssetVariant(downloadAsset),
              }),
            ),
          );
        } else {
          console.log(chalk.green(translate('cli.message.assetsSaved', { paths: summary })));
        }
      } else if (autoDownload) {
        const downloads = await downloadAssetsForChoice(finalVideo.id, 'video', undefined);
        console.log(
          chalk.green(
            translate('cli.message.assetSaved', {
              path: downloads[0]!.path,
              variant: translateAssetVariant('video'),
            }),
          ),
        );
      }

      if (sound) {
        await playSuccessSound(true);
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
      .default('video'),
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

      const remixJob = await remixVideo(videoId, { prompt });
      const formatter = await getCurrencyFormatter();
      const breakdown = calculateVideoCost(remixJob);
      const summary = breakdown ? buildCostSummary(breakdown, formatter) : null;

      if (json) {
        console.log(JSON.stringify(remixJob, null, 2));
      } else {
        console.log(
          chalk.green(
            translate('cli.message.remixQueued', {
              id: remixJob.id,
              source: remixJob.remixed_from_video_id ?? videoId,
            }),
          ),
        );
        console.log(renderStatusLine(remixJob, summary));
        if (!summary) {
          console.log(translate('cli.message.costUnavailable'));
        }
      }

      if (!watch) {
        return;
      }

      let lastRendered = '';
      const renderProgress = (video: SoraVideo) => {
        const line = translate('cli.message.progressLine', {
          status: formatStatus(video.status),
          progress: video.progress.toFixed(0).padStart(3),
        });
        if (line !== lastRendered) {
          process.stdout.write(`\r${line}`);
          lastRendered = line;
        }
      };

      const finalVideo = await waitForVideoCompletion(remixJob.id, {
        pollIntervalMs: pollInterval,
        onUpdate: renderProgress,
      });

      process.stdout.write('\n');

      if (finalVideo.status === 'failed') {
        const message = finalVideo.error?.message ?? translate('cli.message.unknownFailure');
        console.error(chalk.red(translate('cli.message.generationFailed', { message })));
        return;
      }

      console.log(chalk.green(translate('cli.message.remixCompleted', { id: finalVideo.id })));

      const finalBreakdown = calculateVideoCost(finalVideo);
      const finalSummary = finalBreakdown ? buildCostSummary(finalBreakdown, formatter) : null;
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

      if (download !== undefined) {
        const destination = typeof download === 'string' ? download : undefined;
        const downloads = await downloadAssetsForChoice(finalVideo.id, downloadAsset, destination);
        const downloadSummary = renderDownloadSummary(downloads);

        if (downloads.length === 1) {
          console.log(
            chalk.green(
              translate('cli.message.assetSaved', {
                path: downloads[0]!.path,
                variant: translateAssetVariant(downloadAsset),
              }),
            ),
          );
        } else {
          console.log(chalk.green(translate('cli.message.assetsSaved', { paths: downloadSummary })));
        }
      } else if (autoDownload) {
        const downloads = await downloadAssetsForChoice(finalVideo.id, 'video', undefined);
        console.log(
          chalk.green(
            translate('cli.message.assetSaved', {
              path: downloads[0]!.path,
              variant: translateAssetVariant('video'),
            }),
          ),
        );
      }

      if (sound) {
        await playSuccessSound(true);
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
      .default('video'),
  )
  .action(async (videoId: string, { output, asset }: { output?: string; asset: AssetChoice }) => {
    const downloads = await downloadAssetsForChoice(videoId, asset, output);
    const summary = renderDownloadSummary(downloads);

    if (downloads.length === 1) {
      console.log(
        chalk.green(
          translate('cli.message.assetSavedWithId', {
            id: videoId,
            path: downloads[0]!.path,
            variant: translateAssetVariant(asset),
          }),
        ),
      );
      return;
    }

    console.log(
      chalk.green(
        translate('cli.message.assetsSavedWithId', {
          id: videoId,
          paths: summary,
        }),
      ),
    );
  });

program
  .command('tui')
  .description(translate('cli.command.tui.description'))
  .option('--interval <ms>', translate('cli.option.pollIntervalTui'), parseInteger, 5000)
  .option('--no-auto-download', translate('cli.option.autoDownload'))
  .option('--no-sound', translate('cli.option.sound'))
  .action(async ({ interval, autoDownload = true, sound = true }: { interval: number; autoDownload?: boolean; sound?: boolean }) => {
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
