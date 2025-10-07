import React from 'react';
import { Box, Text } from 'ink';

import type { SoraVideo } from '../../api.js';
import type { CurrencyFormatter } from '../../currency.js';
import type { CostSummary } from '../../pricing.js';
import { translate } from '../translate.js';
import { formatStatusLabel } from '../utils.js';

interface TrackingPanelProps {
  jobs: { video: SoraVideo }[];
  summaries: Map<string, CostSummary | null>;
  currencyFormatter: CurrencyFormatter | null;
}

export const TrackingPanel: React.FC<TrackingPanelProps> = ({ jobs, summaries, currencyFormatter }) => {
  if (!jobs.length) {
    return null;
  }

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor="magentaBright"
      paddingX={1}
      paddingY={0}
      gap={1}
    >
      {jobs.map(({ video }) => {
        const summary = summaries.get(video.id);
        return (
          <Box key={video.id} flexDirection="column">
            <Text color="magentaBright">
              {translate('app.trackingHeader', {
                id: video.id,
                status: formatStatusLabel(video.status),
                progress: video.progress.toFixed(0),
              })}
            </Text>
            {video.status === 'failed' && video.error ? (
              <Text color="red">{video.error.message}</Text>
            ) : null}
            {summary ? (
              <Text color="greenBright">
                {translate('app.trackingCost', {
                  value:
                    currencyFormatter && summary.estimatedDisplay.preferred
                      ? summary.estimatedDisplay.preferred
                      : summary.estimatedDisplay.usd,
                })}
              </Text>
            ) : null}
          </Box>
        );
      })}
    </Box>
  );
};
