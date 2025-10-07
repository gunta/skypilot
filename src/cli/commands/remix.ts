import chalk from 'chalk';
import { Command, Option } from 'commander';

import type { SoraVideo } from '../../api.js';
import { calculateVideoCost, buildCostSummary } from '../../pricing.js';
import { ASSET_CHOICES, type AssetChoice } from '../../assets.js';
import { formatVideoStatus } from '@/shared/video.js';
import type { CliContext } from '../context.js';

interface RemixCommandOptions {
  prompt: string;
  watch?: boolean;
  pollInterval?: number;
  download?: string | boolean;
  downloadAsset: AssetChoice;
  json?: boolean;
  autoDownload?: boolean;
  sound?: boolean;
}

export const registerRemixCommand = (program: Command, context: CliContext) => {
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
    .command('remix')
    .description(translate('cli.command.remix.description'))
    .argument('<videoId>', translate('cli.argument.videoId'))
    .requiredOption('-p, --prompt <prompt>', translate('cli.option.remixPrompt'))
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
    .option('--json', translate('cli.option.jsonRemix'), false)
    .action(async (videoId: string, options: RemixCommandOptions) => {
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
          status: formatVideoStatus(video.status),
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
    });
};
