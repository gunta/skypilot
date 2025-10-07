import chalk from 'chalk';

import { translate } from '@/shared/translation.js';

const BANNER_GRADIENT = ['#8E44AD', '#6C5CE7', '#3498DB', '#1ABC9C'];
let bannerRendered = false;

interface RgbColor {
  r: number;
  g: number;
  b: number;
}

const hexToRgb = (hex: string): RgbColor => {
  const normalized = hex.replace('#', '');
  const value = Number.parseInt(normalized, 16);
  return {
    r: (value >> 16) & 0xff,
    g: (value >> 8) & 0xff,
    b: value & 0xff,
  };
};

const mixChannel = (start: number, end: number, t: number) => Math.round(start + (end - start) * t);

const interpolateGradient = (colors: readonly string[], t: number): RgbColor => {
  if (colors.length === 0) {
    return { r: 255, g: 255, b: 255 };
  }
  if (colors.length === 1) {
    return hexToRgb(colors[0]!);
  }

  const clampedT = Math.min(Math.max(t, 0), 1);
  const segmentCount = colors.length - 1;
  const scaled = clampedT * segmentCount;
  const index = Math.min(Math.floor(scaled), segmentCount - 1);
  const localT = scaled - index;
  const start = hexToRgb(colors[index]!);
  const end = hexToRgb(colors[index + 1]!);
  return {
    r: mixChannel(start.r, end.r, localT),
    g: mixChannel(start.g, end.g, localT),
    b: mixChannel(start.b, end.b, localT),
  };
};

export const renderBanner = () => {
  if (bannerRendered) {
    return;
  }
  bannerRendered = true;

  const title = translate('app.bannerTitle');
  const subtitle = translate('app.bannerSubtitle');
  const chars = Array.from(title);
  const gradientText = chars
    .map((char, index) => {
      if (char === ' ') {
        return ' ';
      }
      const t = chars.length === 1 ? 0 : index / (chars.length - 1);
      const color = interpolateGradient(BANNER_GRADIENT, t);
      return chalk.rgb(color.r, color.g, color.b)(char);
    })
    .join('');

  const accent = chalk.hex('#A29BFE')(subtitle);

  console.log();
  console.log(` ${gradientText}`);
  console.log(` ${accent}`);
  console.log();
};
