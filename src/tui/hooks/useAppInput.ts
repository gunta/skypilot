import { useInput } from 'ink';

import { translate } from '@/shared/translation.js';
import type { SoraVideo } from '../../api.js';
import type { Key } from 'ink';
import type { TuiController } from './useTuiController.js';

type UseAppInputOptions = {
  controller: TuiController;
  selectedVideo: SoraVideo | undefined;
  exit: () => void;
};

const handleDeleteConfirmationInput = (input: string, key: Key, options: UseAppInputOptions): boolean => {
  const { controller } = options;
  const pendingDelete = controller.deleteTarget;
  if (!pendingDelete) {
    return false;
  }

  if (key.escape || input === 'n') {
    controller.setActivity(translate('activity.deleteCancelled', { id: pendingDelete.id }));
    controller.setDeleteTarget(null);
    return true;
  }

  if (input === 'y') {
    void controller.handleDelete(pendingDelete);
    return true;
  }

  return true;
};

const handlePromptModeInput = (input: string, key: Key, options: UseAppInputOptions): boolean => {
  const { controller } = options;
  if (controller.mode !== 'prompt') {
    return false;
  }

  if (key.escape) {
    controller.setMode('list');
    controller.setPromptValue('');
  }

  return true;
};

const handleRemixModeInput = (input: string, key: Key, options: UseAppInputOptions): boolean => {
  const { controller } = options;
  if (controller.mode !== 'remix') {
    return false;
  }

  if (key.escape) {
    controller.setMode('list');
    controller.setRemixPromptValue('');
    controller.setRemixTarget(null);
  }

  return true;
};

const handleListControls = (input: string, key: Key, options: UseAppInputOptions) => {
  const { controller, exit, selectedVideo } = options;

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

  if (input === 'e') {
    void controller.exportVideosToCsv();
    return;
  }

  if (input === 'x') {
    if (!selectedVideo) {
      controller.setActivity(translate('activity.remixNoTarget'));
      return;
    }

    if (selectedVideo.status !== 'completed') {
      controller.setActivity(
        translate('activity.remixUnavailable', {
          status: translate(`status.${selectedVideo.status}` as const),
        }),
      );
      return;
    }

    controller.promptHelpers.enableRemixMode(selectedVideo);
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
    if (!selectedVideo) {
      controller.setActivity(translate('activity.deleteNoSelection'));
      return;
    }

    controller.setDeleteTarget(selectedVideo);
    controller.setActivity(translate('activity.deleteConfirm', { id: selectedVideo.id }));
  }
};

export const useAppInput = (options: UseAppInputOptions) => {
  useInput((input, key) => {
    if (handleDeleteConfirmationInput(input, key, options)) {
      return;
    }

    if (handlePromptModeInput(input, key, options)) {
      return;
    }

    if (handleRemixModeInput(input, key, options)) {
      return;
    }

    handleListControls(input, key, options);
  });
};
