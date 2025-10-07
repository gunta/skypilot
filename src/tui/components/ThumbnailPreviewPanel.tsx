import React from 'react';
import { Box, Text } from 'ink';

import { translate } from '@/shared/translation.js';

interface ThumbnailPreviewPanelProps {
  preview: string | null;
  label: string | null;
  error: string | null;
}

export const ThumbnailPreviewPanel: React.FC<ThumbnailPreviewPanelProps> = ({ preview, label, error }) => {
  if (!preview && !error) {
    return null;
  }

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor="yellowBright"
      paddingX={1}
      paddingY={0}
      gap={1}
    >
      <Text color="yellowBright">{translate('app.thumbnailPreviewHeading')}</Text>
      {label ? <Text color="greenBright">{translate('app.thumbnailPreviewLabel', { name: label })}</Text> : null}
      {preview ? <Text>{preview}</Text> : null}
      {error ? <Text color="red">{error}</Text> : null}
    </Box>
  );
};
