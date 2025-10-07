import React, { useMemo } from 'react';
import { Box, useApp, useInput } from 'ink';

import { useTuiController } from './hooks/useTuiController.js';
import { HeaderPanel } from './components/HeaderPanel.js';
import { CurrencyAlert } from './components/CurrencyAlert.js';
import { ActivityPanel } from './components/ActivityPanel.js';
import { PromptModal } from './components/PromptModal.js';
import { RemixModal } from './components/RemixModal.js';
import { StatusTableSection } from './components/StatusTableSection.js';
import { TrackingPanel } from './components/TrackingPanel.js';
import { ThumbnailPreviewPanel } from './components/ThumbnailPreviewPanel.js';
import { translate } from './translate.js';

export interface AppProps {
  pollInterval?: number;
  autoDownload?: boolean;
  playSound?: boolean;
}

const App: React.FC<AppProps> = ({ pollInterval = 5000, autoDownload = true, playSound = true }) => {
  const { exit } = useApp();
  const controller = useTuiController({ pollInterval, autoDownload, playSound });

  const selectedVideo = useMemo(
    () => controller.videos[controller.selectedIndex],
    [controller.videos, controller.selectedIndex],
  );

  const currencyLabel = controller.currencyFormatter ? controller.currencyFormatter.currency : '…';
  const assetLabel = controller.translateVariantLabel(controller.downloadVariant);

  useInput((input, key) => {
    if (controller.deleteTarget) {
      if (key.escape || input === 'n') {
        controller.setActivity(translate('activity.deleteCancelled', { id: controller.deleteTarget.id }));
        controller.setDeleteTarget(null);
        return;
      }

      if (input === 'y') {
        void controller.handleDelete(controller.deleteTarget);
      }
      return;
    }

    if (controller.mode === 'prompt') {
      if (key.escape) {
        controller.setMode('list');
        controller.setPromptValue('');
      }
      return;
    }

    if (controller.mode === 'remix') {
      if (key.escape) {
        controller.setMode('list');
        controller.setRemixPromptValue('');
        controller.setRemixTarget(null);
      }
      return;
    }

    if (key.escape || input === 'q') {
      controller.abortAllTrackers();
      exit();
      return;
    }

    if (key.downArrow || input === 'j') {
      controller.setSelectedIndex((index) => Math.min(index + 1, Math.max(controller.videos.length - 1, 0)));
      return;
    }

    if (key.upArrow || input === 'k') {
      controller.setSelectedIndex((index) => Math.max(index - 1, 0));
      return;
    }

    if (input === 'r') {
      void controller.refresh();
      return;
    }

    if (input === 'c') {
      controller.promptHelpers.enablePromptMode();
      return;
    }

    if (input === 'm') {
      controller.cycleModel();
      return;
    }

    if (input === 's') {
      controller.cycleResolution();
      return;
    }

    if (input === 't') {
      controller.cycleDuration();
      return;
    }

    if (input === 'a') {
      controller.cycleDownloadVariant();
      return;
    }

    if (input === 'x') {
      const target = selectedVideo;
      if (!target) {
        controller.setActivity(translate('activity.remixNoTarget'));
        return;
      }

      if (target.status !== 'completed') {
        controller.setActivity(
          translate('activity.remixUnavailable', {
            status: translate(`status.${target.status}` as const),
          }),
        );
        return;
      }

      controller.promptHelpers.enableRemixMode(target);
      return;
    }

    if (input === 'l') {
      void controller.onLanguageCycle();
      return;
    }

    if (key.return) {
      void controller.handleDownload(selectedVideo);
      return;
    }

    if (input === 'd') {
      const target = selectedVideo;
      if (!target) {
        controller.setActivity(translate('activity.deleteNoSelection'));
        return;
      }

      controller.setDeleteTarget(target);
      controller.setActivity(translate('activity.deleteConfirm', { id: target.id }));
      return;
    }
  });

  return (
    <Box flexDirection="column" paddingX={1} paddingY={1} gap={1}>
      <HeaderPanel
        currencyLabel={currencyLabel}
        model={controller.model}
        duration={controller.duration}
        resolution={controller.resolution}
        assetLabel={assetLabel}
        activeLocale={controller.activeLocale}
      />

      {controller.currencyError ? <CurrencyAlert message={controller.currencyError} /> : null}

      {controller.activity ? <ActivityPanel activity={controller.activity} /> : null}

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
