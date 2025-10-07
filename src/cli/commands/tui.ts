import { Command } from 'commander';

import type { CliContext } from '../context.js';

interface TuiCommandOptions {
  interval: number;
  autoDownload?: boolean;
  sound?: boolean;
}

export const registerTuiCommand = (program: Command, context: CliContext) => {
  const { translate, ensureApiKey, parseInteger } = context;

  program
    .command('tui')
    .description(translate('cli.command.tui.description'))
    .option('--interval <ms>', translate('cli.option.pollIntervalTui'), parseInteger, 5000)
    .option('--no-auto-download', translate('cli.option.autoDownload'))
    .option('--no-sound', translate('cli.option.sound'))
    .action(async ({ interval, autoDownload = true, sound = true }: TuiCommandOptions) => {
      await ensureApiKey();
      const { render } = await import('ink');
      const React = await import('react');
      const { default: App } = await import('../../tui/App.js');

      render(React.createElement(App, { pollInterval: interval, autoDownload, playSound: sound }));
    });
};
