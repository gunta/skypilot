import stringWidth from 'string-width';

import type { SoraVideo } from '../api.js';
import { formatVideoStatus, formatVideoTimestamp } from '@/shared/video.js';

const ZERO_WIDTH_SPACE = '\u200B';

export const toInkTableFriendlyString = (value: string) => {
  const displayWidth = stringWidth(value);
  const codeUnitLength = value.length;

  if (displayWidth <= codeUnitLength) {
    return value;
  }

  return `${value}${ZERO_WIDTH_SPACE.repeat(displayWidth - codeUnitLength)}`;
};

export const getStatusLabel = (status: SoraVideo['status']) => formatVideoStatus(status);

export const formatStatusLabel = (status: SoraVideo['status']) => getStatusLabel(status);

export const formatTimestamp = (seconds: number) => formatVideoTimestamp(seconds);
