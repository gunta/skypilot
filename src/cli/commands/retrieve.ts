import chalk from 'chalk';
import { Command } from 'commander';

import { retrieveVideo } from '../../api.js';
import { buildCostSummary, calculateVideoCost } from '../../pricing.js';
import type { CliContext } from '../context.js';

interface RetrieveCommandOptions {
  json?: boolean;
}

export const registerRetrieveCommand = (program: Command, context: CliContext) => {
  const { translate, ensureApiKey, ensureCurrencyFormatter, renderStatusLine } = context;

  program
    .command('retrieve')
    .description(translate('cli.command.retrieve.description'))
    .argument('<videoId>', translate('cli.argument.videoId'))
    .option('--json', translate('cli.option.json'), false)
    .action(async (videoId: string, options: RetrieveCommandOptions) => {
      await ensureApiKey();
      const video = await retrieveVideo(videoId);
      if (options.json) {
        console.log(JSON.stringify(video, null, 2));
        return;
      }

      const formatter = await ensureCurrencyFormatter();
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
};
