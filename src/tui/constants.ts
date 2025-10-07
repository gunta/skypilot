import type { SoraVideo, VideoAssetVariant } from '../api.js';
import { ALL_VIDEO_ASSET_VARIANTS } from '../api.js';

export const PROGRESS_BAR_WIDTH = 20;

export const makeProgressBar = (progress: number) => {
  const clamped = Math.max(0, Math.min(100, progress));
  const filled = Math.round((clamped / 100) * PROGRESS_BAR_WIDTH);
  return '#'.repeat(filled).padEnd(PROGRESS_BAR_WIDTH, '-');
};

export const MODELS: readonly SoraVideo['model'][] = ['sora-2', 'sora-2-pro'];
export const RESOLUTIONS: readonly SoraVideo['size'][] = [
  '720x1280',
  '1280x720',
  '1024x1792',
  '1792x1024',
];
export const DURATIONS: readonly SoraVideo['seconds'][] = ['4', '8', '12'];

export const STATUS_ORDER: readonly SoraVideo['status'][] = ['completed', 'in_progress', 'queued', 'failed'];

export const STATUS_COLORS: Record<SoraVideo['status'], string> = {
  completed: '#4CAF50',
  in_progress: '#FFC107',
  queued: '#29B6F6',
  failed: '#FF5252',
};

export const ASSET_VARIANTS = ['video_and_thumbnail', ...ALL_VIDEO_ASSET_VARIANTS, 'all'] as const;
export type AssetVariant = (typeof ASSET_VARIANTS)[number];

export const MAX_TRACKED_JOBS = 5;
export const cycleValue = <T,>(options: readonly T[], current: T): T => {
  if (!options.length) {
    return current;
  }
  const index = options.indexOf(current);
  const nextIndex = index === -1 ? 0 : (index + 1) % options.length;
  return options[nextIndex]!;
};

export const isAssetVariant = (value: VideoAssetVariant | AssetVariant): value is AssetVariant =>
  (ASSET_VARIANTS as readonly unknown[]).includes(value);
