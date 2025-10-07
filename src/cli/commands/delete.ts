import chalk from 'chalk';
import { Command } from 'commander';

import type { CliContext } from '../context.js';

interface DeleteCommandOptions {
  json?: boolean;
}

export const registerDeleteCommand = (program: Command, context: CliContext) => {
  const { translate, ensureApiKey, manager } = context;

  program
    .command('delete')
    .description(translate('cli.command.delete.description'))
    .argument('<videoId>', translate('cli.argument.videoId'))
    .option('--json', translate('cli.option.json'), false)
    .action(async (videoId: string, options: DeleteCommandOptions) => {
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
};
