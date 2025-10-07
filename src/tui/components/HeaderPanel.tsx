import React from 'react';
import { Box, Text } from 'ink';

import { translate } from '@/shared/translation.js';

interface HeaderPanelProps {
  currencyLabel: string;
  model: string;
  duration: string;
  resolution: string;
  assetLabel: string;
  activeLocale: string;
  costLabel: string;
}

export const HeaderPanel: React.FC<HeaderPanelProps> = ({
  currencyLabel,
  model,
  duration,
  resolution,
  assetLabel,
  activeLocale,
  costLabel,
}) => (
  <Box flexDirection="column" borderStyle="round" borderColor="magentaBright" paddingX={1} paddingY={1}>
    <Text color="yellowBright">{translate('app.instructions')}</Text>
    <Text color="greenBright">{translate('app.currency', { code: currencyLabel })}</Text>
    <Text color="blueBright">
      {translate('app.controls', {
        model,
        duration,
        resolution,
        asset: assetLabel,
      })}
    </Text>
    <Text color="cyanBright">{costLabel}</Text>
    <Text color="magentaBright">{translate('app.mood')}</Text>
    <Text dimColor>{translate('cli.message.languageCurrent', { language: activeLocale })}</Text>
  </Box>
);
