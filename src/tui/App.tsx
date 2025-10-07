import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box, Text, useApp, useInput } from 'ink';
import Spinner from 'ink-spinner';
import TextInput from 'ink-text-input';
import Table from 'ink-table';
import chalk from 'chalk';

import { playSuccessSound } from '../notify.js';

import {
  createVideo,
  downloadVideoAsset,
  downloadVideoAssets,
  listVideos,
  remixVideo,
  deleteVideo,
  waitForVideoCompletion,
  type SoraVideo,
  type VideoAssetVariant,
  ALL_VIDEO_ASSET_VARIANTS,
} from '../api.js';
import { getCurrencyFormatter, type CurrencyFormatter } from '../currency.js';
import { buildCostSummary, calculateVideoCost } from '../pricing.js';
import { cycleLanguage, getActiveLocale } from '../i18n.js';
import { m } from '../paraglide/messages.js';

const translate = <K extends keyof typeof m>(key: K, params?: Parameters<(typeof m)[K]>[0]) =>
  (m[key] as (args?: Record<string, unknown>) => string)(params ?? {});

const PROGRESS_BAR_WIDTH = 20;

const makeProgressBar = (progress: number) => {
  const clamped = Math.max(0, Math.min(100, progress));
  const filled = Math.round((clamped / 100) * PROGRESS_BAR_WIDTH);
  return `${'#'.repeat(filled).padEnd(PROGRESS_BAR_WIDTH, '-')}`;
};

const MODELS: SoraVideo['model'][] = ['sora-2', 'sora-2-pro'];
const RESOLUTIONS: SoraVideo['size'][] = ['720x1280', '1280x720', '1024x1792', '1792x1024'];
const DURATIONS: SoraVideo['seconds'][] = ['4', '8', '12'];

const cycleValue = <T,>(options: readonly T[], current: T): T => {
  if (!options.length) {
    return current;
  }
  const index = options.indexOf(current);
  const nextIndex = index === -1 ? 0 : (index + 1) % options.length;
  return options[nextIndex]!;
};

const STATUS_ORDER: readonly SoraVideo['status'][] = ['completed', 'in_progress', 'queued', 'failed'];

const STATUS_COLORS: Record<SoraVideo['status'], string> = {
  completed: '#4CAF50',
  in_progress: '#FFC107',
  queued: '#29B6F6',
  failed: '#FF5252',
};

const getStatusLabel = (status: SoraVideo['status']) =>
  translate(`status.${status}` as keyof typeof m);

const formatStatusLabel = (status: SoraVideo['status']) => getStatusLabel(status);

const formatTimestamp = (seconds: number) => new Date(seconds * 1000).toLocaleString();

export interface AppProps {
  pollInterval?: number;
  autoDownload?: boolean;
  playSound?: boolean;
}

type Mode = 'list' | 'prompt' | 'remix';

const ASSET_VARIANTS = [...ALL_VIDEO_ASSET_VARIANTS, 'all'] as const;
type AssetVariant = (typeof ASSET_VARIANTS)[number];

const App: React.FC<AppProps> = ({ pollInterval = 5000, autoDownload = true, playSound = true }) => {
  const [videos, setVideos] = useState<SoraVideo[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>('list');
  const [promptValue, setPromptValue] = useState('');
  const [remixPromptValue, setRemixPromptValue] = useState('');
  const [activity, setActivity] = useState<string | null>(null);
  const [trackedVideo, setTrackedVideo] = useState<SoraVideo | null>(null);
  const [model, setModel] = useState<SoraVideo['model']>('sora-2');
  const [resolution, setResolution] = useState<SoraVideo['size']>('720x1280');
  const [duration, setDuration] = useState<SoraVideo['seconds']>('4');
  const [currencyFormatter, setCurrencyFormatter] = useState<CurrencyFormatter | null>(null);
  const [currencyError, setCurrencyError] = useState<string | null>(null);
  const [activeLocale, setActiveLocale] = useState(getActiveLocale());
  const [downloadVariant, setDownloadVariant] = useState<AssetVariant>('video');
  const [remixTarget, setRemixTarget] = useState<SoraVideo | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SoraVideo | null>(null);

  const isMounted = useRef(true);
  const refreshInFlight = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const { exit } = useApp();

  useEffect(() => {
    return () => {
      isMounted.current = false;
      abortControllerRef.current?.abort();
    };
  }, []);

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

  const tableColumns = useMemo(() => {
    const translateColumn = (key: keyof typeof m) => translate(key);

    return [
      translateColumn('tui.table.column.pointer'),
      translateColumn('tui.table.column.status'),
      translateColumn('tui.table.column.progress'),
      translateColumn('tui.table.column.model'),
      translateColumn('tui.table.column.duration'),
      translateColumn('tui.table.column.resolution'),
      translateColumn('tui.table.column.id'),
      translateColumn('tui.table.column.created'),
      translateColumn('tui.table.column.cost'),
    ] as const;
  }, [activeLocale]);

  const tableData = useMemo(() => {
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

      const row: Record<string, string> = {};
      const columns = tableColumns;

      row[columns[0]] = index === selectedIndex ? '>' : '';
      row[columns[1]] = getStatusLabel(video.status);
      row[columns[2]] = `${video.progress.toFixed(0)}%`;
      row[columns[3]] = video.model;
      row[columns[4]] = `${video.seconds}s`;
      row[columns[5]] = video.size;
      row[columns[6]] = video.id;
      row[columns[7]] = formatTimestamp(video.created_at);
      row[columns[8]] = primaryEstimate
        ? translate('app.rowCost', { value: primaryEstimate })
        : translate('app.rowCostPending');

      return row;
    });
  }, [videos, selectedIndex, currencyFormatter, tableColumns, activeLocale]);


  const trackedCostSummary = useMemo(() => {
    if (!trackedVideo || !currencyFormatter) {
      return null;
    }
    const breakdown = calculateVideoCost(trackedVideo);
    return breakdown ? buildCostSummary(breakdown, currencyFormatter) : null;
  }, [trackedVideo, currencyFormatter]);

  const translateVariantLabel = useCallback(
    (variant: AssetVariant) => translate(`asset.variant.${variant}` as keyof typeof m),
    [activeLocale],
  );

  const handleDownload = useCallback(
    async (video: SoraVideo | undefined) => {
      if (!video) {
        return;
      }

      const variantLabel = translateVariantLabel(downloadVariant);
      setActivity(translate('activity.downloadStart', { id: video.id, variant: variantLabel }));
      try {
        if (downloadVariant === 'all') {
          const paths = await downloadVideoAssets(video.id, ALL_VIDEO_ASSET_VARIANTS);
          if (!isMounted.current) {
            return;
          }

          const formatted = paths
            .map((path, index) => {
              const variant = ALL_VIDEO_ASSET_VARIANTS[index]!;
              return `${translateVariantLabel(variant)} → ${path}`;
            })
            .join(', ');

          setActivity(translate('activity.downloadSuccessAll', { paths: formatted }));
          return;
        }

        const outputPath = await downloadVideoAsset(video.id, { variant: downloadVariant });
        if (!isMounted.current) {
          return;
        }

        setActivity(translate('activity.downloadSuccess', { path: outputPath, variant: variantLabel }));
      } catch (err) {
        if (!isMounted.current) {
          return;
        }

        setActivity(translate('activity.downloadError', { message: (err as Error).message }));
      }
    },
    [downloadVariant, translateVariantLabel],
  );

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
          setTrackedVideo((current) => (current?.id === video.id ? null : current));
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
    [refresh, translate],
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

      setVideos((current) => [created, ...current.filter((item) => item.id !== created.id)]);
      setTrackedVideo(created);
      const createdCostSummary = currencyFormatter
        ? (() => {
            const breakdown = calculateVideoCost(created);
            return breakdown ? buildCostSummary(breakdown, currencyFormatter) : null;
          })()
        : null;

      if (createdCostSummary) {
        const estimateValue = currencyFormatter && createdCostSummary.estimatedDisplay.preferred
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

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      const finalVideo = await waitForVideoCompletion(created.id, {
        pollIntervalMs: Math.max(2000, Math.min(pollInterval, 5000)),
        signal: abortController.signal,
        onUpdate: (video) => {
          if (!isMounted.current) {
            return;
          }

          setTrackedVideo(video);
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
          setActivity(
            translate('activity.completedWithCost', {
              id: finalVideo.id,
              value: actualValue,
            }),
          );
        } else {
          setActivity(translate('activity.completed', { id: finalVideo.id }));
        }

        if (autoDownload) {
          const variantLabel = translateVariantLabel('video');
          setActivity(translate('activity.downloadStart', { id: finalVideo.id, variant: variantLabel }));
          try {
            const path = await downloadVideoAsset(finalVideo.id, { variant: 'video' });
            if (!isMounted.current) {
              return;
            }
            setActivity(translate('activity.downloadSuccess', { path, variant: variantLabel }));
          } catch (err) {
            if (!isMounted.current) {
              return;
            }
            setActivity(translate('activity.downloadError', { message: (err as Error).message }));
          }
        }

        if (playSound) {
          await playSuccessSound(true);
        }
      }

      setTrackedVideo(finalVideo);
      await refresh();
    } catch (err) {
      if (!isMounted.current) {
        return;
      }

      setActivity(translate('activity.error', { message: (err as Error).message }));
    } finally {
      abortControllerRef.current = null;
    }
  }, [autoDownload, currencyFormatter, duration, model, playSound, pollInterval, promptValue, refresh, resolution, translateVariantLabel]);

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

      setVideos((current) => [remixed, ...current.filter((item) => item.id !== remixed.id)]);
      setTrackedVideo(remixed);

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

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      const finalVideo = await waitForVideoCompletion(remixed.id, {
        pollIntervalMs: Math.max(2000, Math.min(pollInterval, 5000)),
        signal: abortController.signal,
        onUpdate: (video) => {
          if (!isMounted.current) {
            return;
          }

          setTrackedVideo(video);
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
          setActivity(
            translate('activity.remixCompletedWithCost', {
              id: finalVideo.id,
              value: actualValue,
            }),
          );
        } else {
          setActivity(translate('activity.remixCompleted', { id: finalVideo.id }));
        }

        if (autoDownload) {
          const variantLabel = translateVariantLabel('video');
          setActivity(translate('activity.downloadStart', { id: finalVideo.id, variant: variantLabel }));
          try {
            const path = await downloadVideoAsset(finalVideo.id, { variant: 'video' });
            if (!isMounted.current) {
              return;
            }
            setActivity(translate('activity.downloadSuccess', { path, variant: variantLabel }));
          } catch (err) {
            if (!isMounted.current) {
              return;
            }
            setActivity(translate('activity.downloadError', { message: (err as Error).message }));
          }
        }

        if (playSound) {
          await playSuccessSound(true);
        }
      }

      setTrackedVideo(finalVideo);
      await refresh();
    } catch (err) {
      if (!isMounted.current) {
        return;
      }

      setActivity(translate('activity.error', { message: (err as Error).message }));
    } finally {
      abortControllerRef.current = null;
    }
  }, [autoDownload, currencyFormatter, playSound, pollInterval, refresh, remixPromptValue, remixTarget, translateVariantLabel]);

  useInput((input, key) => {
    if (deleteTarget) {
      if (key.escape || input === 'n') {
        setActivity(translate('activity.deleteCancelled', { id: deleteTarget.id }));
        setDeleteTarget(null);
        return;
      }

      if (input === 'y') {
        void handleDelete(deleteTarget);
      }
      return;
    }

    if (mode === 'prompt') {
      if (key.escape) {
        setMode('list');
        setPromptValue('');
      }
      return;
    }

    if (mode === 'remix') {
      if (key.escape) {
        setMode('list');
        setRemixPromptValue('');
        setRemixTarget(null);
      }
      return;
    }

    if (key.escape || input === 'q') {
      abortControllerRef.current?.abort();
      exit();
      return;
    }

    if (key.downArrow || input === 'j') {
      setSelectedIndex((index) => Math.min(index + 1, Math.max(videos.length - 1, 0)));
      return;
    }

    if (key.upArrow || input === 'k') {
      setSelectedIndex((index) => Math.max(index - 1, 0));
      return;
    }

    if (input === 'r') {
      void refresh();
      return;
    }

    if (input === 'c') {
      setMode('prompt');
      setPromptValue('');
      return;
    }

    if (input === 'm') {
      setModel((current) => cycleValue(MODELS, current));
      return;
    }

    if (input === 's') {
      setResolution((current) => cycleValue(RESOLUTIONS, current));
      return;
    }

    if (input === 't') {
      setDuration((current) => cycleValue(DURATIONS, current));
      return;
    }

    if (input === 'a') {
      const next = cycleValue(ASSET_VARIANTS, downloadVariant);
      setDownloadVariant(next);
      setActivity(translate('activity.assetVariantChanged', { variant: translateVariantLabel(next) }));
      return;
    }

    if (input === 'x') {
      const target = selectedVideo;
      if (!target) {
        setActivity(translate('activity.remixNoTarget'));
        return;
      }

      if (target.status !== 'completed') {
        setActivity(translate('activity.remixUnavailable', { status: formatStatusLabel(target.status) }));
        return;
      }

      setMode('remix');
      setRemixTarget(target);
      setRemixPromptValue('');
      setActivity(translate('activity.remixStart', { id: target.id }));
      return;
    }

    if (input === 'l') {
      void (async () => {
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
      })();
      return;
    }

    if (key.return) {
      void handleDownload(selectedVideo);
      return;
    }

    if (input === 'd') {
      const target = selectedVideo;
      if (!target) {
        setActivity(translate('activity.deleteNoSelection'));
        return;
      }

      setDeleteTarget(target);
      setActivity(translate('activity.deleteConfirm', { id: target.id }));
      return;
    }
  });

  const currencyLabel = currencyFormatter ? currencyFormatter.currency : '…';

  return (
    <Box flexDirection="column" paddingX={1} paddingY={1} gap={1}>
      <Box flexDirection="column" borderStyle="round" borderColor="magentaBright" paddingX={1} paddingY={1}>
        <Text color="yellowBright">{translate('app.instructions')}</Text>
        <Text color="greenBright">{translate('app.currency', { code: currencyLabel })}</Text>
        <Text color="blueBright">
          {translate('app.controls', {
            model,
            duration,
            resolution,
            asset: translateVariantLabel(downloadVariant),
          })}
        </Text>
        <Text color="magentaBright">{translate('app.mood')}</Text>
        <Text dimColor>{translate('cli.message.languageCurrent', { language: activeLocale })}</Text>
      </Box>

      {currencyError ? (
        <Box borderStyle="round" borderColor="red" paddingX={1} paddingY={0}>
          <Text color="redBright">{translate('app.currencyError', { message: currencyError })}</Text>
        </Box>
      ) : null}

      {activity ? (
        <Box borderStyle="round" borderColor="cyanBright" paddingX={1} paddingY={0}>
          <Text color="cyanBright">{activity}</Text>
        </Box>
      ) : null}

      {mode === 'prompt' ? (
        <Box flexDirection="column" borderStyle="round" borderColor="yellowBright" paddingX={1} paddingY={1}>
          <Text color="yellowBright">{translate('app.promptLabel')}</Text>
          <TextInput
            value={promptValue}
            onChange={setPromptValue}
            onSubmit={() => {
              void handleCreate();
            }}
          />
          <Text dimColor>{translate('app.promptCancel')}</Text>
        </Box>
      ) : null}

      {mode === 'remix' ? (
        <Box flexDirection="column" borderStyle="round" borderColor="magentaBright" paddingX={1} paddingY={1}>
          <Text color="magentaBright">
            {translate('app.remixPromptLabel', {
              id: remixTarget?.id ?? translate('app.remixUnknown'),
            })}
          </Text>
          <TextInput
            value={remixPromptValue}
            onChange={setRemixPromptValue}
            onSubmit={() => {
              void handleRemix();
            }}
          />
          <Text dimColor>{translate('app.remixPromptCancel')}</Text>
        </Box>
      ) : null}

      {isLoading ? (
        <Box>
          <Text>
            <Spinner type="dots" /> {translate('app.loading')}
          </Text>
        </Box>
      ) : error ? (
        <Text color="red">{error}</Text>
      ) : videos.length === 0 ? (
        <Text dimColor>{translate('app.noVideos')}</Text>
      ) : (
        <Box flexDirection="column" gap={1}>
          <Text color="magentaBright">{translate('tui.table.heading')}</Text>
          <Table data={tableData} columns={tableColumns} />
          <Box flexDirection="row" flexWrap="wrap" gap={2}>
            {STATUS_ORDER.map((status) => {
              const count = statusCounts[status] ?? 0;
              const label = translate(`status.${status}` as keyof typeof m);
              const color = STATUS_COLORS[status] ?? '#BDBDBD';
              return <Text key={status}>{chalk.hex(color)(`${label} ×${count}`)}</Text>;
            })}
          </Box>
        </Box>
      )}

      {trackedVideo ? (
        <Box flexDirection="column" borderStyle="round" borderColor="magentaBright" paddingX={1} paddingY={0}>
          <Text color="magentaBright">
            {translate('app.trackingHeader', {
              id: trackedVideo.id,
              status: formatStatusLabel(trackedVideo.status),
              progress: trackedVideo.progress.toFixed(0),
            })}
          </Text>
          {trackedVideo.status === 'failed' && trackedVideo.error ? (
            <Text color="red">{trackedVideo.error.message}</Text>
          ) : null}
          {trackedCostSummary ? (
            <>
              <Text color="greenBright">
                {translate('app.trackingCost', {
                  value:
                    currencyFormatter && trackedCostSummary.estimatedDisplay.preferred
                      ? trackedCostSummary.estimatedDisplay.preferred
                      : trackedCostSummary.estimatedDisplay.usd,
                })}
              </Text>
            </>
          ) : null}
        </Box>
      ) : null}
    </Box>
  );
};

export default App;
