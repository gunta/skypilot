import React from 'react';
import { Box, Text } from 'ink';

interface ActivityPanelProps {
  activity: string;
}

export const ActivityPanel: React.FC<ActivityPanelProps> = ({ activity }) => (
  <Box borderStyle="round" borderColor="cyanBright" paddingX={1} paddingY={0}>
    <Text color="cyanBright">{activity}</Text>
  </Box>
);
