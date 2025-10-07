import type { SoraVideo } from '../api.js';

export type Mode = 'list' | 'prompt' | 'remix';

export interface TrackedJob {
  video: SoraVideo;
  startedAt: number;
}
