import stringWidth from 'string-width';

import type { SoraVideo } from '../api.js';
import { translate } from './translate.js';

const ZERO_WIDTH_SPACE = '\u200B';

export const toInkTableFriendlyString = (value: string) => {
  const displayWidth = stringWidth(value);
  const codeUnitLength = value.length;

  if (displayWidth <= codeUnitLength) {
    return value;
  }

  return `${value}${ZERO_WIDTH_SPACE.repeat(displayWidth - codeUnitLength)}`;
};

export const getStatusLabel = (status: SoraVideo['status']) =>
  translate(`status.${status}` as const);

export const formatStatusLabel = (status: SoraVideo['status']) => getStatusLabel(status);

export const formatTimestamp = (seconds: number) => new Date(seconds * 1000).toLocaleString();
