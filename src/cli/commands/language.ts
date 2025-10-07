import chalk from 'chalk';
import { Command } from 'commander';

import { changeLanguage, cycleLanguage, getActiveLocale, getSupportedLocales } from '../../i18n.js';
import type { CliContext } from '../context.js';

export const registerLanguageCommand = (program: Command, context: CliContext) => {
  const { translate } = context;

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
};
