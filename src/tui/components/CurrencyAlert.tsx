import React from 'react';
import { Box, Text } from 'ink';

import { translate } from '@/shared/translation.js';

interface CurrencyAlertProps {
  message: string;
}

export const CurrencyAlert: React.FC<CurrencyAlertProps> = ({ message }) => (
  <Box borderStyle="round" borderColor="red" paddingX={1} paddingY={0}>
    <Text color="redBright">{translate('app.currencyError', { message })}</Text>
  </Box>
);
