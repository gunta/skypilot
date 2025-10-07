import type { SoraVideo } from '../api.js';
import { translate } from './translate.js';

export const getStatusLabel = (status: SoraVideo['status']) =>
  translate(`status.${status}` as const);

export const formatStatusLabel = (status: SoraVideo['status']) => getStatusLabel(status);

export const formatTimestamp = (seconds: number) => new Date(seconds * 1000).toLocaleString();
