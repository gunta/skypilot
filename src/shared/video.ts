import type { SoraVideo } from '../api.js';
import { translate } from './translation.js';

export const formatVideoStatus = (status: SoraVideo['status']) =>
  translate(`status.${status}` as const);

export const formatVideoTimestamp = (seconds: number) => new Date(seconds * 1000).toLocaleString();
