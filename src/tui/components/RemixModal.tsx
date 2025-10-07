import React from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';

import { translate } from '../translate.js';

interface RemixModalProps {
  value: string;
  targetId: string | null;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export const RemixModal: React.FC<RemixModalProps> = ({ value, targetId, onChange, onSubmit }) => (
  <Box flexDirection="column" borderStyle="round" borderColor="magentaBright" paddingX={1} paddingY={1}>
    <Text color="magentaBright">
      {translate('app.remixPromptLabel', {
        id: targetId ?? translate('app.remixUnknown'),
      })}
    </Text>
    <TextInput
      value={value}
      onChange={onChange}
      onSubmit={onSubmit}
    />
    <Text dimColor>{translate('app.remixPromptCancel')}</Text>
  </Box>
);
