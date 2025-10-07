import chalk from 'chalk';
import { Command } from 'commander';

import { getCurrency, setCurrency } from '../../config/settings.js';
import { getCurrencyFormatter, getExchangeRates } from '../../currency.js';
import { detectLocale } from '../../locale/detect.js';
import type { CliContext } from '../context.js';

export const registerCurrencyCommand = (program: Command, context: CliContext) => {
  const { translate } = context;

  program
    .command('currency')
    .description(translate('cli.command.currency.description'))
    .argument('[code]', translate('cli.command.currency.argument'))
    .action(async (code?: string) => {
      if (!code) {
        const current = await getCurrency();
        const formatter = await getCurrencyFormatter();
        console.log(translate('cli.message.currencyCurrent', { currency: current }));
        console.log(translate('cli.message.currencyExample', { example: formatter.format(1) }));
        const detected = detectLocale();
        if (detected.currency || detected.locale || detected.region) {
          console.log(
            translate('cli.message.currencyDetected', {
              locale: detected.locale ?? 'unknown',
              region: detected.region ?? 'unknown',
              currency: detected.currency ?? 'unknown',
            }),
          );
        }
        return;
      }

      const normalized = code.trim().toUpperCase();

      if (!/^[A-Z]{3}$/.test(normalized)) {
        console.error(chalk.red(translate('cli.message.currencyCodeInvalid')));
        return;
      }

      if (normalized !== 'USD') {
        try {
          const rates = await getExchangeRates('USD');
          if (typeof rates.rates[normalized] !== 'number') {
            console.error(chalk.red(translate('cli.message.currencyRateMissing', { currency: normalized })));
            return;
          }
        } catch (error) {
          console.error(chalk.red(translate('cli.message.currencyError', { message: (error as Error).message })));
          return;
        }
      }

      await setCurrency(normalized);

      const formatter = await getCurrencyFormatter();
      if (formatter.currency !== normalized) {
        console.log(
          chalk.yellow(
            translate('cli.message.currencyFallback', { requested: normalized, actual: formatter.currency }),
          ),
        );
      }
      console.log(translate('cli.message.currencySet', { currency: formatter.currency }));
      console.log(translate('cli.message.currencyExample', { example: formatter.format(1) }));
    });
};
