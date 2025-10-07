import { createWriteStream } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import type { ReadableStream } from 'node:stream/web';

import OpenAI from 'openai';
import type { Video, VideoCreateParams, VideoDeleteResponse, VideoListParams } from 'openai/resources/videos';

let client: OpenAI | null = null;

const createClient = () => {
  try {
    return new OpenAI();
  } catch (error) {
    if (error instanceof Error && error.message.includes('Missing credentials')) {
      throw new Error('Missing OPENAI_API_KEY. Set it before using skypilot.');
    }
    throw error;
  }
};

const getClient = () => {
  if (!client) {
    client = createClient();
  }
  return client;
};

export type SoraVideo = Video;
export type VideoAssetVariant = 'video' | 'thumbnail' | 'spritesheet';
export type DeleteVideoResponse = VideoDeleteResponse;

export const ALL_VIDEO_ASSET_VARIANTS: readonly VideoAssetVariant[] = ['video', 'thumbnail', 'spritesheet'] as const;

const VARIANT_DEFAULTS: Record<VideoAssetVariant, { extension: string; suffix?: string }> = {
  video: { extension: '.mp4' },
  thumbnail: { extension: '.jpg', suffix: 'thumbnail' },
  spritesheet: { extension: '.png', suffix: 'spritesheet' },
};

export const createVideo = async (params: VideoCreateParams): Promise<SoraVideo> => {
  return getClient().videos.create(params);
};

export const retrieveVideo = async (videoId: string): Promise<SoraVideo> => {
  return getClient().videos.retrieve(videoId);
};

export const listVideos = async (params: VideoListParams = {}): Promise<SoraVideo[]> => {
  const results: SoraVideo[] = [];
  const page = getClient().videos.list(params);

  for await (const video of page) {
    results.push(video);
  }

  return results;
};

export interface WaitForVideoOptions {
  pollIntervalMs?: number;
  onUpdate?: (video: SoraVideo) => void;
  signal?: AbortSignal;
}

const sleep = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const onAbort = () => {
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
      reject(new Error('Polling aborted'));
    };

    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);

    if (signal) {
      if (signal.aborted) {
        onAbort();
      } else {
        signal.addEventListener('abort', onAbort);
      }
    }
  });

export const waitForVideoCompletion = async (
  videoId: string,
  { pollIntervalMs = 3_000, onUpdate, signal }: WaitForVideoOptions = {},
): Promise<SoraVideo> => {
  // Emit the current state immediately before entering the polling loop.
  let video = await retrieveVideo(videoId);
  onUpdate?.(video);

  while (video.status === 'queued' || video.status === 'in_progress') {
    if (signal?.aborted) {
      throw new Error('Polling aborted');
    }

    await sleep(pollIntervalMs, signal);
    video = await retrieveVideo(videoId);
    onUpdate?.(video);
  }

  return video;
};

const basenameForVariant = (videoId: string, variant: VideoAssetVariant) => {
  const parsed = path.parse(videoId);
  const base = parsed.ext ? parsed.name : videoId;

  if (variant === 'video') {
    return parsed.ext && parsed.ext.toLowerCase() === '.mp4' ? videoId : `${base}.mp4`;
  }

  const { extension, suffix } = VARIANT_DEFAULTS[variant];
  return `${base}-${suffix}${extension}`;
};

export interface DownloadVideoAssetOptions {
  destination?: string;
  mkdirp?: boolean;
  variant?: VideoAssetVariant;
}

export const downloadVideoAsset = async (
  videoId: string,
  { destination, mkdirp: shouldMkdir = true, variant = 'video' }: DownloadVideoAssetOptions = {},
): Promise<string> => {
  const response = await getClient().videos.downloadContent(videoId, { variant });

  if (!response.ok || !response.body) {
    throw new Error(`Failed to download video ${videoId}: ${response.status} ${response.statusText}`);
  }

  const outputPath = (() => {
    const fileName = destination ?? basenameForVariant(videoId, variant);
    return path.resolve(fileName);
  })();

  if (shouldMkdir) {
    await mkdir(path.dirname(outputPath), { recursive: true });
  }

  const fileStream = createWriteStream(outputPath);
  const sourceStream =
    typeof (response.body as any).pipe === 'function'
      ? (response.body as unknown as NodeJS.ReadableStream)
      : Readable.fromWeb(response.body as ReadableStream<Uint8Array>);

  await pipeline(sourceStream, fileStream);

  return outputPath;
};

export interface DownloadVideoOptions {
  destination?: string;
  mkdirp?: boolean;
}

export const downloadVideo = async (
  videoId: string,
  options: DownloadVideoOptions = {},
): Promise<string> => {
  return downloadVideoAsset(videoId, { ...options, variant: 'video' });
};

export interface RemixVideoParams {
  prompt: string;
}

export const remixVideo = async (videoId: string, params: RemixVideoParams): Promise<SoraVideo> => {
  return getClient().videos.remix(videoId, params);
};

export const deleteVideo = async (videoId: string): Promise<DeleteVideoResponse> => {
  return getClient().videos.delete(videoId);
};

export interface DownloadVideoAssetsOptions extends DownloadVideoAssetOptions {}

export const downloadVideoAssets = async (
  videoId: string,
  variants: readonly VideoAssetVariant[],
  options: DownloadVideoAssetsOptions = {},
): Promise<string[]> => {
  if (!variants.length) {
    return [];
  }

  const uniqueVariants = [...new Set(variants)];
  const { destination } = options;

  if (uniqueVariants.length === 1) {
    const [saved] = await Promise.all([
      downloadVideoAsset(videoId, { ...options, variant: uniqueVariants[0]! }),
    ]);
    return [saved];
  }

  const outputs: string[] = [];
  for (const variant of uniqueVariants) {
    const destinationForVariant = destination
      ? path.join(destination, basenameForVariant(videoId, variant))
      : undefined;
    const savedPath = await downloadVideoAsset(videoId, {
      ...options,
      destination: destinationForVariant,
      variant,
    });
    outputs.push(savedPath);
  }

  return outputs;
};
