#!/usr/bin/env node

import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

import { Command } from 'commander';
import updateNotifier from 'update-notifier';

import { initializeI18n } from '../i18n.js';
import { translate } from '@/shared/translation.js';
import { cliContext } from './context.js';
import { registerListCommand } from './commands/list.js';
import { registerExportCommand } from './commands/export.js';
import { registerRetrieveCommand } from './commands/retrieve.js';
import { registerDeleteCommand } from './commands/delete.js';
import { registerCreateCommand } from './commands/create.js';
import { registerRemixCommand } from './commands/remix.js';
import { registerDownloadCommand } from './commands/download.js';
import { registerTuiCommand } from './commands/tui.js';
import { registerCurrencyCommand } from './commands/currency.js';
import { registerLanguageCommand } from './commands/language.js';
import { renderBanner } from './banner.js';

const require = createRequire(import.meta.url);

interface PackageManifest {
  name: string;
  version: string;
}

const packageManifest = require('../../package.json') as PackageManifest;

const versionNotifier = updateNotifier({
  pkg: {
    name: packageManifest.name,
    version: packageManifest.version,
  },
  shouldNotifyInNpmScript: true,
});

const detectUpdateCommand = (packageName: string) => {
  const userAgent = process.env.npm_config_user_agent ?? '';
  const normalized = userAgent.toLowerCase();

  if (normalized.startsWith('yarn/')) {
    return `yarn global add ${packageName}`;
  }

  if (normalized.startsWith('pnpm/')) {
    return `pnpm add -g ${packageName}`;
  }

  if (normalized.startsWith('bun/')) {
    return `bun add -g ${packageName}`;
  }

  return `npm install -g ${packageName}`;
};

await initializeI18n();

const notifyAboutAvailableUpdate = () => {
  const update = versionNotifier.update;

  if (!update) {
    return;
  }

  const message = translate('cli.message.updateAvailable', {
    packageName: update.name,
    currentVersion: update.current,
    latestVersion: update.latest,
    updateCommand: detectUpdateCommand(update.name),
  });

  versionNotifier.notify({
    message,
  });
};

notifyAboutAvailableUpdate();

export const program = new Command();

program
  .name('skypilot')
  .description(translate('cli.programDescription'));

program.hook('preAction', () => {
  renderBanner();
});

registerListCommand(program, cliContext);
registerExportCommand(program, cliContext);
registerRetrieveCommand(program, cliContext);
registerDeleteCommand(program, cliContext);
registerCreateCommand(program, cliContext);
registerRemixCommand(program, cliContext);
registerDownloadCommand(program, cliContext);
registerTuiCommand(program, cliContext);
registerCurrencyCommand(program, cliContext);
registerLanguageCommand(program, cliContext);


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
