import { createReadStream, existsSync } from 'node:fs';
import path from 'node:path';

import chalk from 'chalk';
import { Command, Option } from 'commander';
import { toFile } from 'openai/uploads';

import type { SoraVideo } from '../../api.js';
import { calculateVideoCost, buildCostSummary } from '../../pricing.js';
import { MODEL_RESOLUTIONS } from '../../modelCapabilities.js';
import { ASSET_CHOICES, type AssetChoice } from '../../assets.js';
import { formatVideoStatus } from '@/shared/video.js';
import type { CliContext } from '../context.js';

interface CreateCommandOptions {
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
}

export const registerCreateCommand = (program: Command, context: CliContext) => {
  const {
    translate,
    ensureApiKey,
    ensureCurrencyFormatter,
    manager,
    translateAssetVariant,
    renderDownloadSummary,
    renderStatusLine,
    parseInteger,
  } = context;

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
        .choices([...ASSET_CHOICES] as AssetChoice[])
        .default('video_and_thumbnail'),
    )
    .option('--no-auto-download', translate('cli.option.autoDownload'))
    .option('--no-sound', translate('cli.option.sound'))
    .option('--json', translate('cli.option.jsonCreate'), false)
    .action(async (options: CreateCommandOptions) => {
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

      const allowedResolutions = MODEL_RESOLUTIONS[model] ?? [];
      if (!allowedResolutions.includes(size)) {
        console.error(
          chalk.red(
            translate('cli.message.resolutionUnsupported', {
              model,
              size,
              resolutions: allowedResolutions.join(', '),
            }),
          ),
        );
        process.exit(1);
      }

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

      const formatter = await ensureCurrencyFormatter();

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
          status: formatVideoStatus(video.status),
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
        const formatterFallback = await ensureCurrencyFormatter();
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
    });
};
