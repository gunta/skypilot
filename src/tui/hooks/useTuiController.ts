import { useCallback, useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { useSelector } from '@xstate/react';

import type { SoraVideo } from '../../api.js';
import { buildCostSummary, calculateVideoCost, type CostSummary } from '../../pricing.js';
import type { CurrencyFormatter } from '../../currency.js';
import { createSoraManagerController, type SoraManagerController } from '../../state/manager.js';
import { downloadAssetsForChoice, type AssetChoice, type DownloadedAssetsSummary } from '../../assets.js';
import { getActiveLocale, cycleLanguage } from '../../i18n.js';
import { translate, type MessageKey } from '../translate.js';
import { ASSET_VARIANTS, DURATIONS, MODELS, RESOLUTIONS, cycleValue } from '../constants.js';
import type { AssetVariant } from '../constants.js';
import type { Mode, TrackedJob } from '../types.js';
import { useThumbnailPreview } from './useThumbnailPreview.js';

interface UseTuiControllerOptions {
  pollInterval: number;
  autoDownload: boolean;
  playSound: boolean;
}

interface TranslationHelpers {
  translateVariantLabel: (variant: AssetVariant) => string;
}

export interface TuiController extends TranslationHelpers {
  videos: SoraVideo[];
  setVideos: Dispatch<SetStateAction<SoraVideo[]>>;
  selectedIndex: number;
  setSelectedIndex: Dispatch<SetStateAction<number>>;
  isLoading: boolean;
  error: string | null;
  mode: Mode;
  setMode: Dispatch<SetStateAction<Mode>>;
  promptValue: string;
  setPromptValue: Dispatch<SetStateAction<string>>;
  remixPromptValue: string;
  setRemixPromptValue: Dispatch<SetStateAction<string>>;
  activity: string | null;
  setActivity: Dispatch<SetStateAction<string | null>>;
  model: SoraVideo['model'];
  setModel: Dispatch<SetStateAction<SoraVideo['model']>>;
  resolution: SoraVideo['size'];
  setResolution: Dispatch<SetStateAction<SoraVideo['size']>>;
  duration: SoraVideo['seconds'];
  setDuration: Dispatch<SetStateAction<SoraVideo['seconds']>>;
  currencyFormatter: CurrencyFormatter | null;
  currencyError: string | null;
  setCurrencyError: Dispatch<SetStateAction<string | null>>;
  activeLocale: string;
  setActiveLocale: Dispatch<SetStateAction<string>>;
  downloadVariant: AssetVariant;
  setDownloadVariant: Dispatch<SetStateAction<AssetVariant>>;
  remixTarget: SoraVideo | null;
  setRemixTarget: Dispatch<SetStateAction<SoraVideo | null>>;
  deleteTarget: SoraVideo | null;
  setDeleteTarget: Dispatch<SetStateAction<SoraVideo | null>>;
  trackedJobs: TrackedJob[];
  sortedTrackedJobs: TrackedJob[];
  trackedSummaries: Map<string, CostSummary | null>;
  handleCreate: () => Promise<void>;
  handleRemix: () => Promise<void>;
  handleDownload: (video: SoraVideo | undefined) => Promise<void>;
  handleDelete: (video: SoraVideo) => Promise<void>;
  abortAllTrackers: () => void;
  refresh: () => Promise<void>;
  statusCounts: Record<SoraVideo['status'] | 'total', number> & { total: number };
  tableColumns: readonly string[];
  tableData: Record<string, string>[];
  cycleModel: () => void;
  cycleResolution: () => void;
  cycleDuration: () => void;
  cycleDownloadVariant: () => void;
  onLanguageCycle: () => Promise<void>;
  promptHelpers: {
    enablePromptMode: () => void;
    enableRemixMode: (video: SoraVideo) => void;
  };
  thumbnailPreview: string | null;
  thumbnailPreviewLabel: string | null;
  thumbnailPreviewError: string | null;
  resetThumbnailPreview: () => void;
}

const toAssetChoice = (variant: AssetVariant): AssetChoice => variant as AssetChoice;

const makeStatusCounts = (videos: SoraVideo[]) => {
  const counts = {
    total: videos.length,
    completed: 0,
    in_progress: 0,
    queued: 0,
    failed: 0,
  } as Record<SoraVideo['status'] | 'total', number> & { total: number };

  for (const video of videos) {
    counts[video.status] = (counts[video.status] ?? 0) + 1;
  }

  return counts;
};

const buildDownloadActivityMessage = (
  summary: DownloadedAssetsSummary,
  translateVariantLabel: (variant: AssetVariant) => string,
) => {
  if (summary.entries.length === 1) {
    const entry = summary.entries[0]!;
    const label = translateVariantLabel(entry.variant as AssetVariant);
    return translate('activity.downloadSuccess', { path: entry.path, variant: label });
  }

  const formatted = summary.entries
    .map(({ variant, path }) => `${translateVariantLabel(variant as AssetVariant)} → ${path}`)
    .join(', ');

  return summary.choice === 'all'
    ? translate('activity.downloadSuccessAll', { paths: formatted })
    : translate('activity.downloadSuccessBundle', { paths: formatted });
};

const useManager = (): SoraManagerController => {
  const ref = useRef<SoraManagerController | null>(null);
  if (!ref.current) {
    ref.current = createSoraManagerController();
  }
  return ref.current;
};

export const useTuiController = ({ pollInterval, autoDownload, playSound }: UseTuiControllerOptions): TuiController => {
  const manager = useManager();
  const actor = manager.actor;

  const videos = useSelector(actor, (state) => state.context.videos);
  const costSummaries = useSelector(actor, (state) => state.context.costSummaries);
  const trackedJobsMap = useSelector(actor, (state) => state.context.trackedJobs);
  const currencyFormatter = useSelector(actor, (state) => state.context.currencyFormatter);
  const currencyErrorState = useSelector(actor, (state) => state.context.currencyError);
  const defaults = useSelector(actor, (state) => state.context.defaults);
  const error = useSelector(actor, (state) => state.context.error);
  const isRefreshing = useSelector(actor, (state) => state.matches({ ready: 'refreshing' }));

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mode, setMode] = useState<Mode>('list');
  const [promptValue, setPromptValue] = useState('');
  const [remixPromptValue, setRemixPromptValue] = useState('');
  const [activity, setActivity] = useState<string | null>(null);
  const [activeLocale, setActiveLocale] = useState<string>(getActiveLocale());
  const [remixTarget, setRemixTarget] = useState<SoraVideo | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SoraVideo | null>(null);
  const [currencyErrorOverride, setCurrencyErrorOverride] = useState<string | null>(null);
  const hasLoadedInitialRef = useRef(false);
  const [hasLoadedInitial, setHasLoadedInitial] = useState(false);

  const currencyError = currencyErrorOverride ?? currencyErrorState;

  const { preview: thumbnailPreview, label: thumbnailPreviewLabel, error: thumbnailPreviewError, showThumbnail, resetPreview: resetThumbnailPreview } =
    useThumbnailPreview();

  const isMounted = useRef(true);
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    const isInitial = !hasLoadedInitialRef.current;
    const loadingMessage = translate('app.loading');

    if (isInitial) {
      setActivity(loadingMessage);
    }

    try {
      await manager.refresh({ limit: 25, order: 'desc' });

      if (!isMounted.current) {
        return;
      }

      if (isInitial) {
        hasLoadedInitialRef.current = true;
        setHasLoadedInitial(true);
        setActivity((current) => (current === loadingMessage ? null : current));
      }
    } catch (err) {
      if (!isMounted.current) {
        return;
      }

      if (isInitial) {
        hasLoadedInitialRef.current = true;
        setHasLoadedInitial(true);
      }

      setActivity(translate('activity.error', { message: (err as Error).message }));
    }
  }, [manager]);

  useEffect(() => {
    void manager.loadCurrency().catch(() => {
      /* handled through currencyError */
    });
    void refresh();
  }, [manager, refresh]);

  useEffect(() => {
    const interval = setInterval(() => {
      void refresh();
    }, pollInterval);
    return () => clearInterval(interval);
  }, [pollInterval, refresh]);

  useEffect(() => {
    if (!videos.length) {
      setSelectedIndex(0);
      return;
    }
    setSelectedIndex((current) => Math.min(current, Math.max(videos.length - 1, 0)));
  }, [videos.length]);

  useEffect(() => {
    setCurrencyErrorOverride(null);
  }, [currencyErrorState]);

  const downloadVariant = defaults.downloadChoice as AssetVariant;
  const model = defaults.model;
  const resolution = defaults.size;
  const duration = defaults.seconds;

  const setModel = useCallback<Dispatch<SetStateAction<SoraVideo['model']>>>((updater) => {
    const current = manager.actor.getSnapshot().context.defaults.model;
    const next = typeof updater === 'function' ? (updater as (prev: SoraVideo['model']) => SoraVideo['model'])(current) : updater;
    manager.setDefaults({ model: next });
  }, [manager]);

  const setResolution = useCallback<Dispatch<SetStateAction<SoraVideo['size']>>>((updater) => {
    const current = manager.actor.getSnapshot().context.defaults.size;
    const next = typeof updater === 'function' ? (updater as (prev: SoraVideo['size']) => SoraVideo['size'])(current) : updater;
    manager.setDefaults({ size: next });
  }, [manager]);

  const setDuration = useCallback<Dispatch<SetStateAction<SoraVideo['seconds']>>>((updater) => {
    const current = manager.actor.getSnapshot().context.defaults.seconds;
    const next = typeof updater === 'function' ? (updater as (prev: SoraVideo['seconds']) => SoraVideo['seconds'])(current) : updater;
    manager.setDefaults({ seconds: next });
  }, [manager]);

  const setDownloadVariant = useCallback<Dispatch<SetStateAction<AssetVariant>>>((updater) => {
    const current = manager.actor.getSnapshot().context.defaults.downloadChoice as AssetVariant;
    const next = typeof updater === 'function' ? (updater as (prev: AssetVariant) => AssetVariant)(current) : updater;
    manager.setDefaults({ downloadChoice: toAssetChoice(next) });
  }, [manager]);

  const isLoading = !hasLoadedInitial || (isRefreshing && videos.length === 0);

  const selectedVideo = useMemo(() => videos[selectedIndex], [videos, selectedIndex]);

  const statusCounts = useMemo(() => makeStatusCounts(videos), [videos]);

  const columnLabels = useMemo(
    () => ({
      pointer: translate('tui.table.column.pointer'),
      status: translate('tui.table.column.status'),
      progress: translate('tui.table.column.progress'),
      model: translate('tui.table.column.model'),
      duration: translate('tui.table.column.duration'),
      resolution: translate('tui.table.column.resolution'),
      id: translate('tui.table.column.id'),
      created: translate('tui.table.column.created'),
      cost: translate('tui.table.column.cost'),
    }),
    [activeLocale],
  );

  const tableColumns = useMemo(
    () => [
      columnLabels.pointer,
      columnLabels.status,
      columnLabels.progress,
      columnLabels.model,
      columnLabels.duration,
      columnLabels.resolution,
      columnLabels.id,
      columnLabels.created,
      columnLabels.cost,
    ],
    [columnLabels],
  );

  const tableData = useMemo(() => {
    return videos.map((video, index) => {
      const costSummary = costSummaries[video.id] ?? null;
      const primaryEstimate = (() => {
        if (!costSummary) {
          return null;
        }
        const preferred = costSummary.estimatedDisplay.preferred;
        if (currencyFormatter && preferred) {
          return preferred;
        }
        return costSummary.estimatedDisplay.usd;
      })();

      return {
        [columnLabels.pointer]: index === selectedIndex ? '>' : '',
        [columnLabels.status]: translate(`status.${video.status}` as MessageKey),
        [columnLabels.progress]: `${video.progress.toFixed(0)}%`,
        [columnLabels.model]: video.model,
        [columnLabels.duration]: `${video.seconds}s`,
        [columnLabels.resolution]: video.size,
        [columnLabels.id]: video.id,
        [columnLabels.created]: new Date(video.created_at * 1000).toLocaleString(),
        [columnLabels.cost]: primaryEstimate
          ? translate('app.rowCost', { value: primaryEstimate })
          : translate('app.rowCostPending'),
      } as Record<string, string>;
    });
  }, [columnLabels, costSummaries, currencyFormatter, selectedIndex, videos]);

  const trackedJobs = useMemo<TrackedJob[]>(() => {
    return Object.values(trackedJobsMap).map((job) => ({ video: job.video, startedAt: job.startedAt }));
  }, [trackedJobsMap]);

  const sortedTrackedJobs = useMemo(() => [...trackedJobs].sort((a, b) => b.startedAt - a.startedAt), [trackedJobs]);

  const trackedSummaries = useMemo(() => {
    const summaries = new Map<string, CostSummary | null>();
    if (!currencyFormatter) {
      return summaries;
    }
    for (const job of trackedJobs) {
      const breakdown = calculateVideoCost(job.video);
      summaries.set(job.video.id, breakdown ? buildCostSummary(breakdown, currencyFormatter) : null);
    }
    return summaries;
  }, [currencyFormatter, trackedJobs]);

  const translateVariantLabel = useCallback(
    (variant: AssetVariant) => translate(`asset.variant.${variant}` as MessageKey),
    [activeLocale],
  );

  const showDownloadPreview = useCallback(
    async (summary: DownloadedAssetsSummary) => {
      const thumbnailEntry = summary.entries.find((entry) => entry.variant === 'thumbnail');
      if (thumbnailEntry) {
        await showThumbnail(thumbnailEntry.path);
      }
    },
    [showThumbnail],
  );

  const handleDownload = useCallback(
    async (video: SoraVideo | undefined) => {
      if (!video) {
        return;
      }

      const variantLabel = translateVariantLabel(downloadVariant);
      setActivity(translate('activity.downloadStart', { id: video.id, variant: variantLabel }));

      try {
        const result = await manager.download({
          videoId: video.id,
          choice: toAssetChoice(downloadVariant),
        });

        if (!isMounted.current) {
          return;
        }

        await showDownloadPreview(result.downloads);
        setActivity(buildDownloadActivityMessage(result.downloads, translateVariantLabel));
      } catch (err) {
        if (!isMounted.current) {
          return;
        }
        setActivity(translate('activity.downloadError', { message: (err as Error).message }));
      }
    },
    [downloadVariant, manager, translateVariantLabel],
  );

  const handleDelete = useCallback(
    async (video: SoraVideo) => {
      setActivity(translate('activity.deleteStart', { id: video.id }));
      try {
        const result = await manager.delete({ videoId: video.id });
        if (!isMounted.current) {
          return;
        }

        if (result.deleted) {
          setActivity(translate('activity.deleteSuccess', { id: result.responseId }));
          setDeleteTarget(null);
          await refresh();
        } else {
          setActivity(translate('activity.deleteNotConfirmed', { id: result.responseId }));
        }
      } catch (err) {
        if (!isMounted.current) {
          return;
        }
        setActivity(translate('activity.deleteError', { message: (err as Error).message }));
      }
    },
    [manager, refresh],
  );

  const cycleModel = useCallback(() => {
    setModel((current) => cycleValue(MODELS, current));
  }, [setModel]);

  const cycleResolution = useCallback(() => {
    setResolution((current) => cycleValue(RESOLUTIONS, current));
  }, [setResolution]);

  const cycleDuration = useCallback(() => {
    setDuration((current) => cycleValue(DURATIONS, current));
  }, [setDuration]);

  const cycleDownloadVariant = useCallback(() => {
    setDownloadVariant((current) => {
      const next = cycleValue(ASSET_VARIANTS, current);
      setActivity(translate('activity.assetVariantChanged', { variant: translateVariantLabel(next) }));
      return next;
    });
  }, [setDownloadVariant, translateVariantLabel]);

  const onLanguageCycle = useCallback(async () => {
    const locale = await cycleLanguage();
    if (!isMounted.current) {
      return;
    }
    setActiveLocale(locale);
    setActivity(translate('activity.languageChanged', { language: locale }));
    try {
      await manager.loadCurrency();
    } catch (err) {
      setCurrencyErrorOverride((err as Error).message);
    }
  }, [manager]);

  const handleCreate = useCallback(async () => {
    const trimmed = promptValue.trim();
    if (!trimmed) {
      setActivity(translate('activity.promptEmpty'));
      return;
    }

    setMode('list');
    setPromptValue('');

    let initialHandled = false;

    try {
      const result = await manager.create({
        prompt: trimmed,
        model,
        seconds: duration,
        size: resolution,
        watch: true,
        pollInterval,
        autoDownload,
        playSound,
        onProgress: (video) => {
          if (initialHandled || !isMounted.current) {
            return;
          }
          initialHandled = true;
          const breakdown = calculateVideoCost(video);
          const summary = currencyFormatter && breakdown ? buildCostSummary(breakdown, currencyFormatter) : null;

          if (summary) {
            const estimateValue = summary.estimatedDisplay.preferred ?? summary.estimatedDisplay.usd;
            setActivity(
              translate('activity.trackingWithCost', {
                id: video.id,
                model,
                seconds: duration,
                resolution,
                value: estimateValue ?? 'n/a',
              }),
            );
          } else {
            setActivity(
              translate('activity.tracking', {
                id: video.id,
                model,
                seconds: duration,
                resolution,
              }),
            );
          }
        },
      });

      if (!isMounted.current) {
        return;
      }

      const finalVideo = result.final;
      if (finalVideo) {
        if (finalVideo.status === 'failed') {
          const message = finalVideo.error?.message ?? translate('cli.message.unknownFailure');
          setActivity(translate('activity.failed', { message }));
        } else {
          let finalSummary = manager.actor.getSnapshot().context.costSummaries[finalVideo.id] ?? null;
          if (!finalSummary && currencyFormatter) {
            const breakdown = calculateVideoCost(finalVideo);
            finalSummary = breakdown ? buildCostSummary(breakdown, currencyFormatter) : null;
          }

          if (finalSummary && finalSummary.actualDisplay.preferred) {
            setActivity(
              translate('activity.completedWithCost', {
                id: finalVideo.id,
                value: finalSummary.actualDisplay.preferred,
              }),
            );
          } else if (finalSummary && finalSummary.actualDisplay.usd) {
            setActivity(
              translate('activity.completedWithCost', {
                id: finalVideo.id,
                value: finalSummary.actualDisplay.usd,
              }),
            );
          } else {
            setActivity(translate('activity.completed', { id: finalVideo.id }));
          }

          if (result.downloads && result.downloads.entries.length) {
            await showDownloadPreview(result.downloads);
            setActivity(buildDownloadActivityMessage(result.downloads, translateVariantLabel));
          }
        }
      }

      resetThumbnailPreview();
      await refresh();
    } catch (err) {
      if (!isMounted.current) {
        return;
      }
      setActivity(translate('activity.error', { message: (err as Error).message }));
    }
  }, [
    autoDownload,
    currencyFormatter,
    duration,
    manager,
    model,
    playSound,
    pollInterval,
    promptValue,
    refresh,
    resolution,
    translateVariantLabel,
  ]);

  const handleRemix = useCallback(async () => {
    const target = remixTarget;
    const trimmed = remixPromptValue.trim();
    if (!target) {
      setActivity(translate('activity.remixNoTarget'));
      return;
    }

    if (!trimmed) {
      setActivity(translate('activity.promptEmpty'));
      return;
    }

    setMode('list');
    setRemixPromptValue('');
    setRemixTarget(null);

    let initialHandled = false;

    try {
      const result = await manager.remix({
        videoId: target.id,
        prompt: trimmed,
        watch: true,
        pollInterval,
        autoDownload,
        playSound,
        download: undefined,
        onProgress: (video) => {
          if (initialHandled || !isMounted.current) {
            return;
          }
          initialHandled = true;
          const breakdown = calculateVideoCost(video);
          const summary = currencyFormatter && breakdown ? buildCostSummary(breakdown, currencyFormatter) : null;

          if (summary) {
            const estimateValue = summary.estimatedDisplay.preferred ?? summary.estimatedDisplay.usd;
            setActivity(
              translate('activity.remixTrackingWithCost', {
                id: video.id,
                source: target.id,
                value: estimateValue ?? 'n/a',
              }),
            );
          } else {
            setActivity(translate('activity.remixTracking', { id: video.id, source: target.id }));
          }
        },
      });

      if (!isMounted.current) {
        return;
      }

      const finalVideo = result.final;
      if (finalVideo) {
        if (finalVideo.status === 'failed') {
          const message = finalVideo.error?.message ?? translate('cli.message.unknownFailure');
          setActivity(translate('activity.failed', { message }));
        } else {
          let finalSummary = manager.actor.getSnapshot().context.costSummaries[finalVideo.id] ?? null;
          if (!finalSummary && currencyFormatter) {
            const breakdown = calculateVideoCost(finalVideo);
            finalSummary = breakdown ? buildCostSummary(breakdown, currencyFormatter) : null;
          }

          if (finalSummary && finalSummary.actualDisplay.preferred) {
            setActivity(
              translate('activity.remixCompletedWithCost', {
                id: finalVideo.id,
                value: finalSummary.actualDisplay.preferred,
              }),
            );
          } else if (finalSummary && finalSummary.actualDisplay.usd) {
            setActivity(
              translate('activity.remixCompletedWithCost', {
                id: finalVideo.id,
                value: finalSummary.actualDisplay.usd,
              }),
            );
          } else {
            setActivity(translate('activity.remixCompleted', { id: finalVideo.id }));
          }

          if (result.downloads && result.downloads.entries.length) {
            await showDownloadPreview(result.downloads);
            setActivity(buildDownloadActivityMessage(result.downloads, translateVariantLabel));
          }
        }
      }

      resetThumbnailPreview();
      await refresh();
    } catch (err) {
      if (!isMounted.current) {
        return;
      }
      setActivity(translate('activity.error', { message: (err as Error).message }));
    }
  }, [
    autoDownload,
    currencyFormatter,
    manager,
    playSound,
    pollInterval,
    refresh,
    remixPromptValue,
    remixTarget,
    translateVariantLabel,
  ]);

  const promptHelpers = useMemo(
    () => ({
      enablePromptMode: () => {
        setMode('prompt');
        setPromptValue('');
      },
      enableRemixMode: (video: SoraVideo) => {
        setMode('remix');
        setRemixTarget(video);
        setRemixPromptValue('');
        setActivity(translate('activity.remixStart', { id: video.id }));
      },
    }),
    [],
  );

  const abortAllTrackers = useCallback(() => {
    // The orchestrator manages polling internally; nothing to cancel explicitly.
  }, []);

  const setVideos: Dispatch<SetStateAction<SoraVideo[]>> = () => {
    // no-op: state managed by machine
  };

  return {
    videos,
    setVideos,
    selectedIndex,
    setSelectedIndex,
    isLoading,
    error,
    mode,
    setMode,
    promptValue,
    setPromptValue,
    remixPromptValue,
    setRemixPromptValue,
    activity,
    setActivity,
    model,
    setModel,
    resolution,
    setResolution,
    duration,
    setDuration,
    currencyFormatter,
    currencyError,
    setCurrencyError: setCurrencyErrorOverride,
    activeLocale,
    setActiveLocale,
    downloadVariant,
    setDownloadVariant,
    remixTarget,
    setRemixTarget,
    deleteTarget,
    setDeleteTarget,
    trackedJobs,
    sortedTrackedJobs,
    trackedSummaries,
    handleCreate,
    handleRemix,
    handleDownload,
    handleDelete,
    abortAllTrackers,
    refresh,
    statusCounts,
    tableColumns,
    tableData,
    cycleModel,
    cycleResolution,
    cycleDuration,
    cycleDownloadVariant,
    onLanguageCycle,
    translateVariantLabel,
    promptHelpers,
    thumbnailPreview,
    thumbnailPreviewLabel,
    thumbnailPreviewError,
    resetThumbnailPreview,
  };
};
