import { assign, createActor, createMachine, fromPromise } from 'xstate';
import type { ActorRefFrom, SnapshotFrom } from 'xstate';

import type { SoraVideo } from '../api.js';
import { createVideo, deleteVideo, listVideos, remixVideo, waitForVideoCompletion } from '../api.js';
import type { CurrencyFormatter } from '../currency.js';
import { getCurrencyFormatter } from '../currency.js';
import type { CostSummary } from '../pricing.js';
import { buildCostSummary, calculateVideoCost } from '../pricing.js';
import { downloadAssetsForChoice, type AssetChoice, type DownloadedAssetsSummary } from '../assets.js';
import { playSuccessSound } from '../notify.js';

type TrackSource = 'create' | 'remix';

export interface TrackedJobState {
  video: SoraVideo;
  source: TrackSource;
  startedAt: number;
  lastUpdate: number;
  completedAt?: number;
}

export interface DefaultsState {
  model: SoraVideo['model'];
  size: SoraVideo['size'];
  seconds: SoraVideo['seconds'];
  downloadChoice: AssetChoice;
  pollInterval: number;
  autoDownload: boolean;
  playSound: boolean;
}

export interface ProgressCallback {
  (video: SoraVideo): void;
}

export interface CreateRequest {
  prompt: string;
  model?: SoraVideo['model'];
  seconds?: SoraVideo['seconds'];
  size?: SoraVideo['size'];
  watch?: boolean;
  pollInterval?: number;
  autoDownload?: boolean;
  playSound?: boolean;
  download?: {
    choice: AssetChoice;
    destination?: string;
  };
  inputReference?: Parameters<typeof createVideo>[0]['input_reference'];
  onProgress?: ProgressCallback;
}

export interface RemixRequest {
  videoId: string;
  prompt: string;
  watch?: boolean;
  pollInterval?: number;
  autoDownload?: boolean;
  playSound?: boolean;
  download?: {
    choice: AssetChoice;
    destination?: string;
  };
  onProgress?: ProgressCallback;
}

export interface DownloadRequest {
  videoId: string;
  choice: AssetChoice;
  destination?: string;
}

export interface DeleteRequest {
  videoId: string;
}

export interface RefreshRequest {
  limit?: number;
  order?: 'asc' | 'desc';
}

export type OperationResult =
  | {
      type: 'refresh';
      videos: SoraVideo[];
      summaries: Record<string, CostSummary | null>;
      formatter: CurrencyFormatter | null;
    }
  | {
      type: 'create';
      request: CreateRequest;
      initial: SoraVideo;
      final?: SoraVideo;
      downloads?: DownloadedAssetsSummary | null;
    }
  | {
      type: 'remix';
      request: RemixRequest;
      initial: SoraVideo;
      final?: SoraVideo;
      downloads?: DownloadedAssetsSummary | null;
    }
  | {
      type: 'download';
      request: DownloadRequest;
      downloads: DownloadedAssetsSummary;
    }
  | {
      type: 'delete';
      request: DeleteRequest;
      deleted: boolean;
      responseId: string;
    }
  | {
      type: 'currency';
      formatter: CurrencyFormatter;
    };

export interface SoraContext {
  videos: SoraVideo[];
  trackedJobs: Record<string, TrackedJobState>;
  costSummaries: Record<string, CostSummary | null>;
  currencyFormatter: CurrencyFormatter | null;
  currencyError: string | null;
  defaults: DefaultsState;
  operationVersion: number;
  lastOperation: OperationResult | null;
  error: string | null;
}

export type InternalEvent =
  | { type: 'TRACK_START'; job: TrackedJobState }
  | { type: 'TRACK_UPDATE'; video: SoraVideo }
  | { type: 'TRACK_COMPLETE'; video: SoraVideo };

export type PublicEvent =
  | { type: 'REFRESH'; params?: RefreshRequest }
  | { type: 'CREATE'; input: CreateRequest }
  | { type: 'REMIX'; input: RemixRequest }
  | { type: 'DOWNLOAD'; input: DownloadRequest }
  | { type: 'DELETE'; input: DeleteRequest }
  | { type: 'LOAD_CURRENCY' }
  | { type: 'SET_DEFAULTS'; defaults: Partial<DefaultsState> }
  | { type: 'RESET_ERROR' }
  | { type: 'CLEAR_OPERATION' };

export type SoraEvent = PublicEvent | InternalEvent;

const initialContext: SoraContext = {
  videos: [],
  trackedJobs: {},
  costSummaries: {},
  currencyFormatter: null,
  currencyError: null,
  defaults: {
    model: 'sora-2',
    size: '720x1280',
    seconds: '4',
    downloadChoice: 'video_and_thumbnail',
    pollInterval: 5000,
    autoDownload: true,
    playSound: true,
  },
  operationVersion: 0,
  lastOperation: null,
  error: null,
};

const mergeSummaries = (
  videos: readonly SoraVideo[],
  formatter: CurrencyFormatter | null,
): Record<string, CostSummary | null> => {
  const summaries: Record<string, CostSummary | null> = {};
  for (const video of videos) {
    const breakdown = calculateVideoCost(video);
    summaries[video.id] = formatter && breakdown ? buildCostSummary(breakdown, formatter) : null;
  }
  return summaries;
};

const soraMachine = createMachine({
  id: 'sora-manager',
  types: {} as {
    context: SoraContext;
    events: SoraEvent;
  },
  context: initialContext,
  initial: 'ready',
  states: {
    ready: {
      initial: 'idle',
      states: {
        idle: {
          on: {
            REFRESH: 'refreshing',
            CREATE: 'creating',
            REMIX: 'remixing',
            DOWNLOAD: 'downloading',
            DELETE: 'deleting',
            LOAD_CURRENCY: 'loadingCurrency',
            SET_DEFAULTS: {
              actions: assign(({ context, event }) => ({
                defaults: { ...context.defaults, ...event.defaults },
              })),
            },
            RESET_ERROR: {
              actions: assign({ error: () => null }),
            },
            CLEAR_OPERATION: {
              actions: assign({ lastOperation: () => null }),
            },
            TRACK_START: {
              actions: assign(({ context, event }) => ({
                trackedJobs: {
                  ...context.trackedJobs,
                  [event.job.video.id]: event.job,
                },
              })),
            },
            TRACK_UPDATE: {
              actions: assign(({ context, event }) => {
                const existing = context.trackedJobs[event.video.id];
                if (!existing) {
                  return {};
                }
                return {
                  trackedJobs: {
                    ...context.trackedJobs,
                    [event.video.id]: {
                      ...existing,
                      video: event.video,
                      lastUpdate: Date.now(),
                    },
                  },
                };
              }),
            },
            TRACK_COMPLETE: {
              actions: assign(({ context, event }) => {
                const existing = context.trackedJobs[event.video.id];
                if (!existing) {
                  return {};
                }
                return {
                  trackedJobs: {
                    ...context.trackedJobs,
                    [event.video.id]: {
                      ...existing,
                      video: event.video,
                      lastUpdate: Date.now(),
                      completedAt: Date.now(),
                    },
                  },
                };
              }),
            },
          },
        },
        refreshing: {
          invoke: {
            id: 'refreshVideos',
            src: fromPromise(async ({ input }) => {
              const params = (input as { params?: RefreshRequest }).params;
              const [videos, formatter] = await Promise.all([
                listVideos(params),
                getCurrencyFormatter().catch(() => null),
              ]);
              return {
                videos,
                formatter,
                summaries: mergeSummaries(videos, formatter),
              };
            }),
            input: ({ event }) => ({ params: event.type === 'REFRESH' ? event.params : undefined }),
            onDone: {
              target: 'idle',
              actions: assign(({ context, event }) => ({
                videos: event.output.videos,
                currencyFormatter: event.output.formatter,
                currencyError: null,
                costSummaries: event.output.summaries,
                operationVersion: context.operationVersion + 1,
                lastOperation: {
                  type: 'refresh',
                  videos: event.output.videos,
                  summaries: event.output.summaries,
                  formatter: event.output.formatter,
                } as OperationResult,
                error: null,
              })),
            },
            onError: {
              target: 'idle',
              actions: assign(({ context, event }) => ({
                error: event.error instanceof Error ? event.error.message : String(event.error),
                operationVersion: context.operationVersion + 1,
              })),
            },
          },
        },
        creating: {
          invoke: {
            id: 'createVideoFlow',
            src: fromPromise(async ({ input, self }) => {
              const { request, defaults } = input as { request: CreateRequest; defaults: DefaultsState };
              const merged = {
                prompt: request.prompt,
                model: request.model ?? defaults.model,
                seconds: request.seconds ?? defaults.seconds,
                size: request.size ?? defaults.size,
                watch: request.watch ?? false,
                pollInterval: request.pollInterval ?? defaults.pollInterval,
                autoDownload: request.autoDownload ?? defaults.autoDownload,
                playSound: request.playSound ?? defaults.playSound,
                download: request.download,
                inputReference: request.inputReference,
                onProgress: request.onProgress,
              };

              const created = await createVideo({
                prompt: merged.prompt,
                model: merged.model,
                seconds: merged.seconds,
                size: merged.size,
                input_reference: merged.inputReference,
              });

              self.send({
                type: 'TRACK_START',
                job: {
                  video: created,
                  source: 'create',
                  startedAt: Date.now(),
                  lastUpdate: Date.now(),
                },
              });

              merged.onProgress?.(created);

              if (!merged.watch) {
                return {
                  request,
                  initial: created,
                  final: undefined,
                  downloads: null,
                };
              }

              const finalVideo = await waitForVideoCompletion(created.id, {
                pollIntervalMs: merged.pollInterval,
                onUpdate: (video) => {
                  merged.onProgress?.(video);
                  self.send({ type: 'TRACK_UPDATE', video });
                },
              });

              self.send({ type: 'TRACK_COMPLETE', video: finalVideo });

              let downloads: DownloadedAssetsSummary | null = null;
              if (finalVideo.status === 'completed') {
                if (merged.download) {
                  downloads = await downloadAssetsForChoice(finalVideo.id, merged.download.choice, {
                    destination: merged.download.destination,
                  });
                } else if (merged.autoDownload) {
                  downloads = await downloadAssetsForChoice(finalVideo.id, defaults.downloadChoice);
                }

                if (merged.playSound) {
                  await playSuccessSound(true);
                }
              }

              return {
                request,
                initial: created,
                final: finalVideo,
                downloads,
              };
            }),
            input: ({ context, event }) => ({
              request: event.type === 'CREATE' ? event.input : undefined,
              defaults: context.defaults,
            }),
            onDone: {
              target: 'idle',
              actions: assign(({ context, event }) => {
                const final = event.output.final ?? event.output.initial;
                const videos = [final, ...context.videos.filter((video) => video.id !== final.id)];
                const summaries = { ...context.costSummaries };
                const formatter = context.currencyFormatter;
                const breakdown = calculateVideoCost(final);
                summaries[final.id] = formatter && breakdown ? buildCostSummary(breakdown, formatter) : null;

                return {
                  videos,
                  costSummaries: summaries,
                  operationVersion: context.operationVersion + 1,
                  lastOperation: {
                    type: 'create',
                    request: event.output.request,
                    initial: event.output.initial,
                    final: event.output.final,
                    downloads: event.output.downloads ?? undefined,
                  } as OperationResult,
                  error: null,
                };
              }),
            },
            onError: {
              target: 'idle',
              actions: assign(({ context, event }) => ({
                error: event.error instanceof Error ? event.error.message : String(event.error),
                operationVersion: context.operationVersion + 1,
              })),
            },
          },
        },
        remixing: {
          invoke: {
            id: 'remixVideoFlow',
            src: fromPromise(async ({ input, self }) => {
              const { request, defaults } = input as { request: RemixRequest; defaults: DefaultsState };
              const merged = {
                videoId: request.videoId,
                prompt: request.prompt,
                watch: request.watch ?? false,
                pollInterval: request.pollInterval ?? defaults.pollInterval,
                autoDownload: request.autoDownload ?? defaults.autoDownload,
                playSound: request.playSound ?? defaults.playSound,
                download: request.download,
                onProgress: request.onProgress,
              };

              const remixed = await remixVideo(merged.videoId, { prompt: merged.prompt });

              self.send({
                type: 'TRACK_START',
                job: {
                  video: remixed,
                  source: 'remix',
                  startedAt: Date.now(),
                  lastUpdate: Date.now(),
                },
              });

              merged.onProgress?.(remixed);

              if (!merged.watch) {
                return {
                  request,
                  initial: remixed,
                  final: undefined,
                  downloads: null,
                };
              }

              const finalVideo = await waitForVideoCompletion(remixed.id, {
                pollIntervalMs: merged.pollInterval,
                onUpdate: (video) => {
                  merged.onProgress?.(video);
                  self.send({ type: 'TRACK_UPDATE', video });
                },
              });

              self.send({ type: 'TRACK_COMPLETE', video: finalVideo });

              let downloads: DownloadedAssetsSummary | null = null;
              if (finalVideo.status === 'completed') {
                if (merged.download) {
                  downloads = await downloadAssetsForChoice(finalVideo.id, merged.download.choice, {
                    destination: merged.download.destination,
                  });
                } else if (merged.autoDownload) {
                  downloads = await downloadAssetsForChoice(finalVideo.id, defaults.downloadChoice);
                }

                if (merged.playSound) {
                  await playSuccessSound(true);
                }
              }

              return {
                request,
                initial: remixed,
                final: finalVideo,
                downloads,
              };
            }),
            input: ({ context, event }) => ({
              request: event.type === 'REMIX' ? event.input : undefined,
              defaults: context.defaults,
            }),
            onDone: {
              target: 'idle',
              actions: assign(({ context, event }) => {
                const final = event.output.final ?? event.output.initial;
                const videos = [final, ...context.videos.filter((video) => video.id !== final.id)];
                const summaries = { ...context.costSummaries };
                const formatter = context.currencyFormatter;
                const breakdown = calculateVideoCost(final);
                summaries[final.id] = formatter && breakdown ? buildCostSummary(breakdown, formatter) : null;

                return {
                  videos,
                  costSummaries: summaries,
                  operationVersion: context.operationVersion + 1,
                  lastOperation: {
                    type: 'remix',
                    request: event.output.request,
                    initial: event.output.initial,
                    final: event.output.final,
                    downloads: event.output.downloads ?? undefined,
                  } as OperationResult,
                  error: null,
                };
              }),
            },
            onError: {
              target: 'idle',
              actions: assign(({ context, event }) => ({
                error: event.error instanceof Error ? event.error.message : String(event.error),
                operationVersion: context.operationVersion + 1,
              })),
            },
          },
        },
        downloading: {
          invoke: {
            id: 'downloadAssetsFlow',
            src: fromPromise(async ({ input }) => {
              const { request } = input as { request: DownloadRequest };
              const downloads = await downloadAssetsForChoice(request.videoId, request.choice, {
                destination: request.destination,
              });
              return { request, downloads };
            }),
            input: ({ event }) => ({ request: event.type === 'DOWNLOAD' ? event.input : undefined }),
            onDone: {
              target: 'idle',
              actions: assign(({ context, event }) => ({
                operationVersion: context.operationVersion + 1,
                lastOperation: {
                  type: 'download',
                  request: event.output.request,
                  downloads: event.output.downloads,
                } as OperationResult,
                error: null,
              })),
            },
            onError: {
              target: 'idle',
              actions: assign(({ context, event }) => ({
                error: event.error instanceof Error ? event.error.message : String(event.error),
                operationVersion: context.operationVersion + 1,
              })),
            },
          },
        },
        deleting: {
          invoke: {
            id: 'deleteVideoFlow',
            src: fromPromise(async ({ input }) => {
              const { request } = input as { request: DeleteRequest };
              const response = await deleteVideo(request.videoId);
              return { request, deleted: response.deleted, responseId: response.id };
            }),
            input: ({ event }) => ({ request: event.type === 'DELETE' ? event.input : undefined }),
            onDone: {
              target: 'idle',
              actions: assign(({ context, event }) => {
                const videos = event.output.deleted
                  ? context.videos.filter((video) => video.id !== event.output.request.videoId)
                  : context.videos;
                const summaries = { ...context.costSummaries };
                if (event.output.deleted) {
                  delete summaries[event.output.request.videoId];
                }
               return {
                 videos,
                 costSummaries: summaries,
                 operationVersion: context.operationVersion + 1,
                 lastOperation: {
                   type: 'delete',
                   request: event.output.request,
                   deleted: event.output.deleted,
                   responseId: event.output.responseId,
                  } as OperationResult,
                 error: null,
               };
             }),
            },
            onError: {
              target: 'idle',
              actions: assign(({ context, event }) => ({
                error: event.error instanceof Error ? event.error.message : String(event.error),
                operationVersion: context.operationVersion + 1,
              })),
            },
          },
        },
        loadingCurrency: {
          invoke: {
            id: 'loadCurrency',
            src: fromPromise(async () => getCurrencyFormatter()),
            onDone: {
              target: 'idle',
              actions: assign(({ context, event }) => ({
                currencyFormatter: event.output,
                currencyError: null,
                operationVersion: context.operationVersion + 1,
                lastOperation: {
                  type: 'currency',
                  formatter: event.output,
                } as OperationResult,
                error: null,
              })),
            },
            onError: {
              target: 'idle',
              actions: assign(({ context, event }) => ({
                currencyError: event.error instanceof Error ? event.error.message : String(event.error),
                error: event.error instanceof Error ? event.error.message : String(event.error),
                operationVersion: context.operationVersion + 1,
              })),
            },
          },
        },
      },
    },
  },
});

export type SoraActorRef = ActorRefFrom<typeof soraMachine>;
export type SoraSnapshot = SnapshotFrom<SoraActorRef>;

export const createSoraManager = () => {
  const actor = createActor(soraMachine);
  actor.start();
  return actor;
};
