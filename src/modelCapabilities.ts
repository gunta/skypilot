import type { SoraVideo } from './api.js';

export const MODEL_RESOLUTIONS: Record<SoraVideo['model'], readonly SoraVideo['size'][]> = {
  'sora-2': ['720x1280', '1280x720'],
  'sora-2-pro': ['720x1280', '1280x720', '1024x1792', '1792x1024'],
} as const;

export const UNIQUE_RESOLUTIONS = Array.from(
  new Set(Object.values(MODEL_RESOLUTIONS).flat()),
) as SoraVideo['size'][];

export const clampResolutionForModel = (
  model: SoraVideo['model'],
  resolution: SoraVideo['size'],
): SoraVideo['size'] => {
  const allowed = MODEL_RESOLUTIONS[model] ?? UNIQUE_RESOLUTIONS;
  return (allowed.includes(resolution) ? resolution : allowed[0]) ?? resolution;
};

export const getNextResolutionForModel = (
  model: SoraVideo['model'],
  current: SoraVideo['size'],
): SoraVideo['size'] => {
  const allowed = MODEL_RESOLUTIONS[model] ?? UNIQUE_RESOLUTIONS;
  if (!allowed.length) {
    return current;
  }

  const index = allowed.indexOf(current);
  if (index === -1) {
    return allowed[0]!;
  }

  const nextIndex = (index + 1) % allowed.length;
  return allowed[nextIndex]!;
};
