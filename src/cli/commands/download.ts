import chalk from 'chalk';
import { Command, Option } from 'commander';

import { ASSET_CHOICES, type AssetChoice } from '../../assets.js';
import type { CliContext } from '../context.js';

interface DownloadCommandOptions {
  output?: string;
  asset: AssetChoice;
}

export const registerDownloadCommand = (program: Command, context: CliContext) => {
  const { translate, ensureApiKey, manager, translateAssetVariant, renderDownloadSummary } = context;

  program
    .command('download')
    .description(translate('cli.command.download.description'))
    .argument('<videoId>', translate('cli.argument.videoId'))
    .option('-o, --output <path>', translate('cli.option.output'))
    .addOption(
      new Option('-a, --asset <variant>', translate('cli.option.asset'))
        .choices([...ASSET_CHOICES] as AssetChoice[])
        .default('video_and_thumbnail'),
    )
    .action(async (videoId: string, { output, asset }: DownloadCommandOptions) => {
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
};
