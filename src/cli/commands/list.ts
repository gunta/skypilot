import chalk from 'chalk';
import { Command, Option } from 'commander';

import type { SoraVideo } from '../../api.js';
import type { CliContext } from '../context.js';

interface ListCommandOptions {
  status?: SoraVideo['status'][];
  limit: number;
  order: 'asc' | 'desc';
}

export const registerListCommand = (program: Command, context: CliContext) => {
  const { translate, ensureApiKey, manager, renderStatusLine, validStatuses, parseInteger } = context;

  program
    .command('list')
    .description(translate('cli.command.list.description'))
    .addOption(new Option('-s, --status <status...>', translate('cli.option.status')).choices(validStatuses))
    .option('-l, --limit <number>', translate('cli.option.limit'), parseInteger, 20)
    .addOption(
      new Option('--order <order>', translate('cli.option.order')).choices(['asc', 'desc'] as const).default('desc'),
    )
    .action(async ({ status, limit, order }: ListCommandOptions) => {
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
};
