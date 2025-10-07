import React from 'react';
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import Table from 'ink-table';
import chalk from 'chalk';

import type { SoraVideo } from '../../api.js';
import { STATUS_COLORS, STATUS_ORDER } from '../constants.js';
import { translate } from '../translate.js';

interface StatusTableSectionProps {
  isLoading: boolean;
  error: string | null;
  hasVideos: boolean;
  tableData: Record<string, string>[];
  tableColumns: readonly string[];
  statusCounts: Record<SoraVideo['status'] | 'total', number> & { total: number };
}

export const StatusTableSection: React.FC<StatusTableSectionProps> = ({
  isLoading,
  error,
  hasVideos,
  tableData,
  tableColumns,
  statusCounts,
}) => {
  if (isLoading) {
    return (
      <Box>
        <Text>
          <Spinner type="dots" /> {translate('app.loading')}
        </Text>
      </Box>
    );
  }

  if (error) {
    return <Text color="red">{error}</Text>;
  }

  if (!hasVideos) {
    return <Text dimColor>{translate('app.noVideos')}</Text>;
  }

  return (
    <Box flexDirection="column" gap={1}>
      <Text color="magentaBright">{translate('tui.table.heading')}</Text>
      <Table data={tableData} columns={tableColumns} />
      <Box flexDirection="row" flexWrap="wrap" gap={2}>
        {STATUS_ORDER.map((status) => {
          const count = statusCounts[status] ?? 0;
          const label = translate(`status.${status}` as const);
          const color = STATUS_COLORS[status] ?? '#BDBDBD';
          return <Text key={status}>{chalk.hex(color)(`${label} ×${count}`)}</Text>;
        })}
      </Box>
    </Box>
  );
};
