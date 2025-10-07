import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { CurrencyFormatter } from '../../currency.js';
import { getCurrencyFormatter } from '../../currency.js';
import type { SoraVideo } from '../../api.js';
import { createVideo, deleteVideo, remixVideo, waitForVideoCompletion } from '../../api.js';
import { listVideos } from '../../api.js';
import { buildCostSummary, calculateVideoCost } from '../../pricing.js';
import { cycleLanguage, getActiveLocale } from '../../i18n.js';
import { translate, type MessageKey } from '../translate.js';
import { ASSET_VARIANTS, DURATIONS, MODELS, RESOLUTIONS, cycleValue } from '../constants.js';
import type { AssetVariant } from '../constants.js';
import { downloadAssetsForVariant } from '../assetDownload.js';
import { useThumbnailPreview } from './useThumbnailPreview.js';
import { useTrackedJobs } from './useTrackedJobs.js';
import type { Mode } from '../types.js';
import { playSuccessSound } from '../../notify.js';

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
  setVideos: React.Dispatch<React.SetStateAction<SoraVideo[]>>;
  selectedIndex: number;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
  isLoading: boolean;
  error: string | null;
  mode: Mode;
  setMode: React.Dispatch<React.SetStateAction<Mode>>;
  promptValue: string;
  setPromptValue: React.Dispatch<React.SetStateAction<string>>;
  remixPromptValue: string;
  setRemixPromptValue: React.Dispatch<React.SetStateAction<string>>;
  activity: string | null;
  setActivity: React.Dispatch<React.SetStateAction<string | null>>;
  model: SoraVideo['model'];
  setModel: React.Dispatch<React.SetStateAction<SoraVideo['model']>>;
  resolution: SoraVideo['size'];
  setResolution: React.Dispatch<React.SetStateAction<SoraVideo['size']>>;
  duration: SoraVideo['seconds'];
  setDuration: React.Dispatch<React.SetStateAction<SoraVideo['seconds']>>;
  currencyFormatter: CurrencyFormatter | null;
  currencyError: string | null;
  setCurrencyError: React.Dispatch<React.SetStateAction<string | null>>;
  activeLocale: string;
  setActiveLocale: React.Dispatch<React.SetStateAction<string>>;
  downloadVariant: AssetVariant;
  setDownloadVariant: React.Dispatch<React.SetStateAction<AssetVariant>>;
  remixTarget: SoraVideo | null;
  setRemixTarget: React.Dispatch<React.SetStateAction<SoraVideo | null>>;
  deleteTarget: SoraVideo | null;
  setDeleteTarget: React.Dispatch<React.SetStateAction<SoraVideo | null>>;
  trackedJobs: ReturnType<typeof useTrackedJobs>['trackedJobs'];
  sortedTrackedJobs: ReturnType<typeof useTrackedJobs>['sortedTrackedJobs'];
  trackedSummaries: ReturnType<typeof useTrackedJobs>['trackedSummaries'];
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

export const useTuiController = ({
  pollInterval,
  autoDownload,
  playSound: shouldPlaySound,
}: UseTuiControllerOptions): TuiController => {
  const [videos, setVideos] = useState<SoraVideo[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>('list');
  const [promptValue, setPromptValue] = useState('');
  const [remixPromptValue, setRemixPromptValue] = useState('');
  const [activity, setActivity] = useState<string | null>(null);
  const [model, setModel] = useState<SoraVideo['model']>('sora-2');
  const [resolution, setResolution] = useState<SoraVideo['size']>('720x1280');
  const [duration, setDuration] = useState<SoraVideo['seconds']>('4');
  const [currencyFormatter, setCurrencyFormatter] = useState<CurrencyFormatter | null>(null);
  const [currencyError, setCurrencyError] = useState<string | null>(null);
  const [activeLocale, setActiveLocale] = useState<string>(getActiveLocale());
  const [downloadVariant, setDownloadVariant] = useState<AssetVariant>('video_and_thumbnail');
  const [remixTarget, setRemixTarget] = useState<SoraVideo | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SoraVideo | null>(null);

  const isMounted = useRef(true);
  const refreshInFlight = useRef(false);
  const activeTrackersRef = useRef<Map<string, AbortController>>(new Map());

  const {
    preview: thumbnailPreview,
    label: thumbnailPreviewLabel,
    error: thumbnailPreviewError,
    showThumbnail,
    resetPreview: resetThumbnailPreview,
  } = useThumbnailPreview();

  const {
    trackedJobs,
    sortedTrackedJobs,
    trackedSummaries,
    upsertTrackedJob,
    removeTrackedJob,
  } = useTrackedJobs({ currencyFormatter });

  const translateVariantLabel = useCallback(
    (variant: AssetVariant) => {
      const key = `asset.variant.${variant}` as MessageKey;
      return translate(key);
    },
    [activeLocale],
  );

  const abortAllTrackers = useCallback(() => {
    for (const controller of activeTrackersRef.current.values()) {
      controller.abort();
    }
    activeTrackersRef.current.clear();
  }, []);

  useEffect(() => {
    return () => {
      isMounted.current = false;
      abortAllTrackers();
    };
  }, [abortAllTrackers]);

  useEffect(() => {
    let cancelled = false;

    const loadCurrency = async () => {
      try {
        const formatter = await getCurrencyFormatter();
        if (!cancelled) {
          setCurrencyFormatter(formatter);
          setCurrencyError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setCurrencyFormatter(null);
          setCurrencyError((err as Error).message);
        }
      }
    };

    void loadCurrency();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!videos.length) {
      setSelectedIndex(0);
      return;
    }

    setSelectedIndex((current) => Math.min(current, Math.max(videos.length - 1, 0)));
  }, [videos.length]);

  const refresh = useCallback(async () => {
    if (refreshInFlight.current) {
      return;
    }

    try {
      refreshInFlight.current = true;
      const latest = await listVideos({ order: 'desc', limit: 25 });
      if (!isMounted.current) {
        return;
      }

      setVideos(latest);
      setError(null);
    } catch (err) {
      if (!isMounted.current) {
        return;
      }

      setError((err as Error).message);
    } finally {
      refreshInFlight.current = false;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setIsLoading(true);
      await refresh();
      if (!cancelled && isMounted.current) {
        setIsLoading(false);
      }
    };

    void run();

    const interval = setInterval(() => {
      void refresh();
    }, pollInterval);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [pollInterval, refresh]);

  const selectedVideo = useMemo(() => videos[selectedIndex], [videos, selectedIndex]);

  const statusCounts = useMemo(() => {
    const counts = {
      total: videos.length,
      completed: 0,
      in_progress: 0,
      queued: 0,
      failed: 0,
    } as Record<SoraVideo['status'] | 'total', number> & {
      total: number;
    };

    for (const video of videos) {
      counts[video.status] = (counts[video.status] ?? 0) + 1;
    }

    return counts;
  }, [videos]);

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
    const { pointer, status, progress, model, duration: durationCol, resolution, id, created, cost } = columnLabels;

    return videos.map((video, index) => {
      const costSummary = currencyFormatter
        ? (() => {
            const breakdown = calculateVideoCost(video);
            return breakdown ? buildCostSummary(breakdown, currencyFormatter) : null;
          })()
        : null;

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

      const statusKey = `status.${video.status}` as MessageKey;

      const row: Record<string, string> = {
        [pointer]: index === selectedIndex ? '>' : '',
        [status]: translate(statusKey),
        [progress]: `${video.progress.toFixed(0)}%`,
        [model]: video.model,
        [durationCol]: `${video.seconds}s`,
        [resolution]: video.size,
        [id]: video.id,
        [created]: new Date(video.created_at * 1000).toLocaleString(),
        [cost]: primaryEstimate
          ? translate('app.rowCost', { value: primaryEstimate })
          : translate('app.rowCostPending'),
      };

      return row;
    });
  }, [columnLabels, currencyFormatter, selectedIndex, videos]);

  const downloadAndPreview = useCallback(
    async (videoId: string, variant: AssetVariant) => {
      const result = await downloadAssetsForVariant(videoId, variant);
      if (!isMounted.current) {
        return result;
      }

      const thumbnailIndex = result.variants.findIndex((item) => item === 'thumbnail');
      if (thumbnailIndex !== -1) {
        void showThumbnail(result.paths[thumbnailIndex]!);
      }

      return result;
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
        const result = await downloadAndPreview(video.id, downloadVariant);
        if (!isMounted.current) {
          return;
        }

        if (result.paths.length > 1) {
          const formatted = result.paths
            .map((path, index) => {
              const resolvedVariant = result.variants[index]!;
              return `${translateVariantLabel(resolvedVariant as AssetVariant)} → ${path}`;
            })
            .join(', ');

          const key = (result.variant === 'all'
            ? 'activity.downloadSuccessAll'
            : 'activity.downloadSuccessBundle') as MessageKey;
          setActivity(translate(key, { paths: formatted }));
        } else {
          const resolvedVariant = result.variants[0]!;
          const resolvedLabel = translateVariantLabel(resolvedVariant as AssetVariant);
          setActivity(translate('activity.downloadSuccess', { path: result.paths[0]!, variant: resolvedLabel }));
        }
      } catch (err) {
        if (!isMounted.current) {
          return;
        }

        setActivity(translate('activity.downloadError', { message: (err as Error).message }));
      }
    },
    [downloadAndPreview, downloadVariant, translateVariantLabel],
  );

  const monitorVideoLifecycle = useCallback(
    (
      initialVideo: SoraVideo,
      origin: 'create' | 'remix',
      autoDownloadVariant: AssetVariant = 'video_and_thumbnail',
    ) => {
      const abortController = new AbortController();
      activeTrackersRef.current.set(initialVideo.id, abortController);

      const pollIntervalMs = Math.max(2000, Math.min(pollInterval, 5000));

      const run = async () => {
        try {
          const finalVideo = await waitForVideoCompletion(initialVideo.id, {
            pollIntervalMs,
            signal: abortController.signal,
            onUpdate: (video) => {
              if (!isMounted.current) {
                return;
              }

              upsertTrackedJob(video);
              setVideos((current) => {
                const idx = current.findIndex((item) => item.id === video.id);
                if (idx === -1) {
                  return [video, ...current];
                }

                const copy = [...current];
                copy[idx] = video;
                return copy;
              });
            },
          });

          if (!isMounted.current) {
            return;
          }

          upsertTrackedJob(finalVideo);
          setVideos((current) => {
            const idx = current.findIndex((item) => item.id === finalVideo.id);
            if (idx === -1) {
              return [finalVideo, ...current];
            }

            const copy = [...current];
            copy[idx] = finalVideo;
            return copy;
          });

          if (finalVideo.status === 'failed') {
            const message = finalVideo.error?.message ?? translate('cli.message.unknownFailure');
            setActivity(translate('activity.failed', { message }));
          } else {
            const finalCostSummary = currencyFormatter
              ? (() => {
                  const breakdown = calculateVideoCost(finalVideo);
                  return breakdown ? buildCostSummary(breakdown, currencyFormatter) : null;
                })()
              : null;

            if (finalCostSummary && finalCostSummary.actualUsd !== null) {
              const actualValue =
                currencyFormatter && finalCostSummary.actualDisplay.preferred
                  ? finalCostSummary.actualDisplay.preferred
                  : finalCostSummary.actualDisplay.usd ?? 'n/a';
              const key = (origin === 'create'
                ? 'activity.completedWithCost'
                : 'activity.remixCompletedWithCost') as MessageKey;
              setActivity(
                translate(key, {
                  id: finalVideo.id,
                  value: actualValue,
                }),
              );
            } else {
              const key = (origin === 'create' ? 'activity.completed' : 'activity.remixCompleted') as MessageKey;
              setActivity(
                translate(key, {
                  id: finalVideo.id,
                }),
              );
            }

            if (autoDownload) {
              const variantLabel = translateVariantLabel(autoDownloadVariant);
              setActivity(translate('activity.downloadStart', { id: finalVideo.id, variant: variantLabel }));
              try {
                const result = await downloadAndPreview(finalVideo.id, autoDownloadVariant);
                if (!isMounted.current) {
                  return;
                }

                if (result.paths.length > 1) {
                  const formatted = result.paths
                    .map((path, index) => {
                      const resolvedVariant = result.variants[index]!;
                      return `${translateVariantLabel(resolvedVariant as AssetVariant)} → ${path}`;
                    })
                    .join(', ');

                  const key = (result.variant === 'all'
                    ? 'activity.downloadSuccessAll'
                    : 'activity.downloadSuccessBundle') as MessageKey;
                  setActivity(translate(key, { paths: formatted }));
                } else {
                  const resolvedVariant = result.variants[0]!;
                  const resolvedLabel = translateVariantLabel(resolvedVariant as AssetVariant);
                  setActivity(
                    translate('activity.downloadSuccess', {
                      path: result.paths[0]!,
                      variant: resolvedLabel,
                    }),
                  );
                }
              } catch (err) {
                if (!isMounted.current) {
                  return;
                }
                setActivity(translate('activity.downloadError', { message: (err as Error).message }));
              }
            }

            if (shouldPlaySound) {
              await playSuccessSound(true);
            }
          }

          void refresh();
        } catch (err) {
          if (!isMounted.current) {
            return;
          }

          if ((err as Error).message === 'Polling aborted') {
            return;
          }

          setActivity(translate('activity.error', { message: (err as Error).message }));
        } finally {
          activeTrackersRef.current.delete(initialVideo.id);
        }
      };

      void run();
    },
    [
      autoDownload,
      currencyFormatter,
      downloadAndPreview,
      pollInterval,
      refresh,
      shouldPlaySound,
      translateVariantLabel,
      upsertTrackedJob,
    ],
  );

  const handleCreate = useCallback(async () => {
    const trimmed = promptValue.trim();
    if (!trimmed) {
      setActivity(translate('activity.promptEmpty'));
      return;
    }

    setActivity(translate('activity.submitting'));
    setMode('list');
    setPromptValue('');

    try {
      const created = await createVideo({
        prompt: trimmed,
        model,
        seconds: duration,
        size: resolution,
      });

      if (!isMounted.current) {
        return;
      }

      upsertTrackedJob(created);
      setVideos((current) => {
        const idx = current.findIndex((item) => item.id === created.id);
        if (idx === -1) {
          return [created, ...current];
        }
        const copy = [...current];
        copy[idx] = created;
        return copy;
      });

      const createdCostSummary = currencyFormatter
        ? (() => {
            const breakdown = calculateVideoCost(created);
            return breakdown ? buildCostSummary(breakdown, currencyFormatter) : null;
          })()
        : null;

      if (createdCostSummary) {
        const estimateValue =
          currencyFormatter && createdCostSummary.estimatedDisplay.preferred
            ? createdCostSummary.estimatedDisplay.preferred
            : createdCostSummary.estimatedDisplay.usd;
        setActivity(
          translate('activity.trackingWithCost', {
            id: created.id,
            model,
            seconds: duration,
            resolution,
            value: estimateValue,
          }),
        );
      } else {
        setActivity(
          translate('activity.tracking', {
            id: created.id,
            model,
            seconds: duration,
            resolution,
          }),
        );
      }

      monitorVideoLifecycle(created, 'create', downloadVariant);
    } catch (err) {
      if (!isMounted.current) {
        return;
      }

      setActivity(translate('activity.error', { message: (err as Error).message }));
    }
  }, [
    currencyFormatter,
    downloadVariant,
    duration,
    model,
    monitorVideoLifecycle,
    promptValue,
    resolution,
    upsertTrackedJob,
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

    setActivity(translate('activity.remixSubmitting', { id: target.id }));
    setMode('list');
    setRemixPromptValue('');
    setRemixTarget(null);

    try {
      const remixed = await remixVideo(target.id, { prompt: trimmed });

      if (!isMounted.current) {
        return;
      }

      upsertTrackedJob(remixed);
      setVideos((current) => {
        const idx = current.findIndex((item) => item.id === remixed.id);
        if (idx === -1) {
          return [remixed, ...current];
        }
        const copy = [...current];
        copy[idx] = remixed;
        return copy;
      });

      const remixCostSummary = currencyFormatter
        ? (() => {
            const breakdown = calculateVideoCost(remixed);
            return breakdown ? buildCostSummary(breakdown, currencyFormatter) : null;
          })()
        : null;

      if (remixCostSummary) {
        const estimateValue =
          currencyFormatter && remixCostSummary.estimatedDisplay.preferred
            ? remixCostSummary.estimatedDisplay.preferred
            : remixCostSummary.estimatedDisplay.usd;
        setActivity(
          translate('activity.remixTrackingWithCost', {
            id: remixed.id,
            source: target.id,
            value: estimateValue,
          }),
        );
      } else {
        setActivity(
          translate('activity.remixTracking', {
            id: remixed.id,
            source: target.id,
          }),
        );
      }

      monitorVideoLifecycle(remixed, 'remix', downloadVariant);
    } catch (err) {
      if (!isMounted.current) {
        return;
      }

      setActivity(translate('activity.error', { message: (err as Error).message }));
    }
  }, [
    currencyFormatter,
    downloadVariant,
    monitorVideoLifecycle,
    remixPromptValue,
    remixTarget,
    upsertTrackedJob,
  ]);

  const handleDelete = useCallback(
    async (video: SoraVideo) => {
      setActivity(translate('activity.deleteStart', { id: video.id }));

      try {
        const response = await deleteVideo(video.id);
        if (!isMounted.current) {
          return;
        }

        if (response.deleted) {
          setActivity(translate('activity.deleteSuccess', { id: response.id }));
          removeTrackedJob(video.id);
          setVideos((current) => current.filter((item) => item.id !== video.id));
          await refresh();
        } else {
          setActivity(translate('activity.deleteNotConfirmed', { id: response.id }));
        }
      } catch (err) {
        if (!isMounted.current) {
          return;
        }

        setActivity(translate('activity.deleteError', { message: (err as Error).message }));
      } finally {
        setDeleteTarget(null);
      }
    },
    [refresh, removeTrackedJob],
  );

  const cycleModel = useCallback(() => {
    setModel((current) => cycleValue(MODELS, current));
  }, []);

  const cycleResolution = useCallback(() => {
    setResolution((current) => cycleValue(RESOLUTIONS, current));
  }, []);

  const cycleDuration = useCallback(() => {
    setDuration((current) => cycleValue(DURATIONS, current));
  }, []);

  const cycleDownloadVariant = useCallback(() => {
    setDownloadVariant((current) => {
      const next = cycleValue(ASSET_VARIANTS, current);
      setActivity(translate('activity.assetVariantChanged', { variant: translateVariantLabel(next) }));
      return next;
    });
  }, [translateVariantLabel]);

  const onLanguageCycle = useCallback(async () => {
    const locale = await cycleLanguage();
    if (!isMounted.current) {
      return;
    }
    setActiveLocale(locale);
    setActivity(translate('activity.languageChanged', { language: locale }));

    try {
      const formatter = await getCurrencyFormatter();
      if (!isMounted.current) {
        return;
      }
      setCurrencyFormatter(formatter);
      setCurrencyError(null);
    } catch (err) {
      if (!isMounted.current) {
        return;
      }
      setCurrencyFormatter(null);
      setCurrencyError((err as Error).message);
    }
  }, []);

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
    setCurrencyError,
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
