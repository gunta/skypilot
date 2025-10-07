import chalk from 'chalk';
import { Command, Option } from 'commander';

import type { SoraVideo } from '../../api.js';
import { exportVideosToCsv } from '../../export/csv.js';
import type { CliContext } from '../context.js';

interface ExportCommandOptions {
  status?: SoraVideo['status'][];
  limit: number;
  order: 'asc' | 'desc';
  output?: string;
}

export const registerExportCommand = (program: Command, context: CliContext) => {
  const { translate, ensureApiKey, ensureCurrencyFormatter, manager, validStatuses, parseInteger } = context;

  program
    .command('export')
    .description(translate('cli.command.export.description'))
    .addOption(new Option('-s, --status <status...>', translate('cli.option.status')).choices(validStatuses))
    .option('-l, --limit <number>', translate('cli.option.limit'), parseInteger, 100)
    .addOption(
      new Option('--order <order>', translate('cli.option.order')).choices(['asc', 'desc'] as const).default('desc'),
    )
    .option('-o, --output <path>', translate('cli.option.output'))
    .action(async ({ status, limit, order, output }: ExportCommandOptions) => {
      await ensureApiKey();
      const currencyFormatter = await ensureCurrencyFormatter();

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
    });
};
