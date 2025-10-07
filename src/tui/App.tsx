import React from 'react';
import { Box, useApp } from 'ink';

import { useTuiController } from './hooks/useTuiController.js';
import { useAppDerivedState } from './hooks/useAppDerivedState.js';
import { useAppInput } from './hooks/useAppInput.js';
import { HeaderPanel } from './components/HeaderPanel.js';
import { BrandBanner } from './components/BrandBanner.js';
import { CurrencyAlert } from './components/CurrencyAlert.js';
import { ActivityPanel } from './components/ActivityPanel.js';
import { PromptModal } from './components/PromptModal.js';
import { RemixModal } from './components/RemixModal.js';
import { StatusTableSection } from './components/StatusTableSection.js';
import { TrackingPanel } from './components/TrackingPanel.js';
import { ThumbnailPreviewPanel } from './components/ThumbnailPreviewPanel.js';

export interface AppProps {
  pollInterval?: number;
  autoDownload?: boolean;
  playSound?: boolean;
}

const App: React.FC<AppProps> = ({ pollInterval = 5000, autoDownload = true, playSound = true }) => {
  const { exit } = useApp();
  const controller = useTuiController({ pollInterval, autoDownload, playSound });
  const { selectedVideo, currencyLabel, assetLabel, activityMessage, shouldShowActivityPanel, costLabel } =
    useAppDerivedState(controller);

  useAppInput({ controller, selectedVideo, exit });

  return (
    <Box flexDirection="column" paddingX={1} paddingY={1} gap={1}>
      <BrandBanner />

      <HeaderPanel
        currencyLabel={currencyLabel}
        model={controller.model}
        duration={controller.duration}
        resolution={controller.resolution}
        assetLabel={assetLabel}
        activeLocale={controller.activeLocale}
        costLabel={costLabel}
      />

      {controller.currencyError ? <CurrencyAlert message={controller.currencyError} /> : null}

      {shouldShowActivityPanel && activityMessage ? <ActivityPanel activity={activityMessage} /> : null}

      {controller.mode === 'prompt' ? (
        <PromptModal
          value={controller.promptValue}
          onChange={controller.setPromptValue}
          onSubmit={() => {
            void controller.handleCreate();
          }}
        />
      ) : null}

      {controller.mode === 'remix' ? (
        <RemixModal
          value={controller.remixPromptValue}
          targetId={controller.remixTarget?.id ?? null}
          onChange={controller.setRemixPromptValue}
          onSubmit={() => {
            void controller.handleRemix();
          }}
        />
      ) : null}

      <StatusTableSection
        isLoading={controller.isLoading}
        error={controller.error}
        hasVideos={controller.videos.length > 0}
        tableData={controller.tableData}
        tableColumns={controller.tableColumns}
        statusCounts={controller.statusCounts}
      />

      <TrackingPanel
        jobs={controller.sortedTrackedJobs}
        summaries={controller.trackedSummaries}
        currencyFormatter={controller.currencyFormatter}
      />

      <ThumbnailPreviewPanel
        preview={controller.thumbnailPreview}
        label={controller.thumbnailPreviewLabel}
        error={controller.thumbnailPreviewError}
      />
    </Box>
  );
};

export default App;
