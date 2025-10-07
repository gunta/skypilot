import { useMemo } from 'react';

import { translate } from '@/shared/translation.js';
import type { SoraVideo } from '../../api.js';
import type { TuiController } from './useTuiController.js';

export type AppDerivedState = {
  selectedVideo: SoraVideo | undefined;
  currencyLabel: string;
  assetLabel: string;
  activityMessage: string | null;
  shouldShowActivityPanel: boolean;
  costLabel: string;
};

export const useAppDerivedState = (controller: TuiController): AppDerivedState => {
  const selectedVideo = useMemo(
    () => controller.videos.at(controller.selectedIndex),
    [controller.videos, controller.selectedIndex],
  );

  const currencyLabel = controller.currencyFormatter ? controller.currencyFormatter.currency : '…';
  const assetLabel = controller.translateVariantLabel(controller.downloadVariant);
  const activityMessage = controller.activity;
  const loadingMessage = translate('app.loading');
  const shouldShowActivityPanel =
    activityMessage !== null && !(controller.isLoading && activityMessage === loadingMessage);

  const costLabel = useMemo(() => {
    const estimate = controller.estimatedCost;
    if (!estimate) {
      return translate('app.costUnavailable');
    }

    return estimate.isConverted
      ? translate('app.costEstimateWithUsd', { preferred: estimate.preferred, usd: estimate.usd })
      : translate('app.costEstimate', { value: estimate.preferred });
  }, [controller.estimatedCost, controller.activeLocale]);

  return {
    selectedVideo,
    currencyLabel,
    assetLabel,
    activityMessage,
    shouldShowActivityPanel,
    costLabel,
  };
};
