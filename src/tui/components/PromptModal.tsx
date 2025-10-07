import React from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';

import { translate } from '../translate.js';

interface PromptModalProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export const PromptModal: React.FC<PromptModalProps> = ({ value, onChange, onSubmit }) => (
  <Box flexDirection="column" borderStyle="round" borderColor="yellowBright" paddingX={1} paddingY={1}>
    <Text color="yellowBright">{translate('app.promptLabel')}</Text>
    <TextInput
      value={value}
      onChange={onChange}
      onSubmit={onSubmit}
    />
    <Text dimColor>{translate('app.promptCancel')}</Text>
  </Box>
);
