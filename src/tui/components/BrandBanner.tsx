import React from 'react';
import { Box, Text } from 'ink';
import Gradient from 'ink-gradient';
import BigText from 'ink-big-text';

import { translate } from '@/shared/translation.js';

const GRADIENT_COLORS = ['#8E44AD', '#6C5CE7', '#3498DB', '#1ABC9C'];

export const BrandBanner: React.FC = () => {
  return (
    <Box flexDirection="column" alignItems="center" marginBottom={1}>
      <Gradient colors={GRADIENT_COLORS}>
        <BigText text={translate('app.bannerTitle')} font="simple" align="center" />
      </Gradient>
      <Text dimColor>{translate('app.bannerSubtitle')}</Text>
    </Box>
  );
};
