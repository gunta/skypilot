import type { SoraVideo } from '../api.js';
import { ASSET_CHOICES } from '../assets.js';
import { MODEL_RESOLUTIONS, UNIQUE_RESOLUTIONS } from '../modelCapabilities.js';

export const PROGRESS_BAR_WIDTH = 20;

export const makeProgressBar = (progress: number) => {
  const clamped = Math.max(0, Math.min(100, progress));
  const filled = Math.round((clamped / 100) * PROGRESS_BAR_WIDTH);
  return '#'.repeat(filled).padEnd(PROGRESS_BAR_WIDTH, '-');
};

export const MODELS: readonly SoraVideo['model'][] = ['sora-2', 'sora-2-pro'];
export const RESOLUTIONS: readonly SoraVideo['size'][] = UNIQUE_RESOLUTIONS;
export const DURATIONS: readonly SoraVideo['seconds'][] = ['4', '8', '12'];

export const STATUS_ORDER: readonly SoraVideo['status'][] = ['completed', 'in_progress', 'queued', 'failed'];

export const STATUS_COLORS: Record<SoraVideo['status'], string> = {
  completed: '#4CAF50',
  in_progress: '#FFC107',
  queued: '#29B6F6',
  failed: '#FF5252',
};

export const ASSET_VARIANTS = ASSET_CHOICES;
export type AssetVariant = (typeof ASSET_VARIANTS)[number];

export { MODEL_RESOLUTIONS };

export const MAX_TRACKED_JOBS = 5;
export const cycleValue = <T,>(options: readonly T[], current: T): T => {
  if (!options.length) {
    return current;
  }
  const index = options.indexOf(current);
  const nextIndex = index === -1 ? 0 : (index + 1) % options.length;
  return options[nextIndex]!;
};
