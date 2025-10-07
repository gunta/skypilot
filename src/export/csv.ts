import { writeFile } from 'node:fs/promises';
import path from 'node:path';

import type { SoraVideo } from '../api.js';
import type { CurrencyFormatter } from '../currency.js';
import { formatUsd } from '../currency.js';
import type { CostSummary } from '../pricing.js';
import { buildCostSummary, calculateVideoCost } from '../pricing.js';

import type { TranslateFn } from '../tui/translate.js';

const CSV_HEADERS = [
  'id',
  'status',
  'status_label',
  'progress_percent',
  'model',
  'duration_seconds',
  'resolution',
  'created_at_iso',
  'created_at_local',
  'estimated_cost_preferred',
  'estimated_cost_usd',
  'actual_cost_preferred',
  'actual_cost_usd',
  'preferred_currency',
];

export interface VideoCsvRow {
  id: string;
  status: SoraVideo['status'];
  statusLabel: string;
  progress: number;
  model: SoraVideo['model'];
  durationSeconds: number;
  resolution: SoraVideo['size'];
  createdAtIso: string;
  createdAtLocal: string;
  estimatedPreferred: string | null;
  estimatedUsd: string | null;
  actualPreferred: string | null;
  actualUsd: string | null;
  preferredCurrency: string | null;
}

const escapeCsvField = (value: string | number | null | undefined) => {
  if (value === undefined || value === null) {
    return '';
  }

  const stringValue = String(value);
  if (!/[",\n]/.test(stringValue)) {
    return stringValue;
  }

  return `"${stringValue.replace(/"/g, '""')}"`;
};

const serializeRows = (rows: VideoCsvRow[]) => {
  const lines = [CSV_HEADERS.join(',')];

  for (const row of rows) {
    lines.push(
      [
        row.id,
        row.status,
        row.statusLabel,
        row.progress,
        row.model,
        row.durationSeconds,
        row.resolution,
        row.createdAtIso,
        row.createdAtLocal,
        row.estimatedPreferred,
        row.estimatedUsd,
        row.actualPreferred,
        row.actualUsd,
        row.preferredCurrency,
      ]
        .map(escapeCsvField)
        .join(','),
    );
  }

  return `${lines.join('\n')}\n`;
};

export const buildVideoCsvRows = (
  videos: readonly SoraVideo[],
  summaries: Record<string, CostSummary | null>,
  translate: TranslateFn,
  currencyFormatter: CurrencyFormatter | null,
): VideoCsvRow[] => {
  return videos.map((video) => {
    const createdAt = new Date(video.created_at * 1000);
    const summary = (() => {
      const existing = summaries[video.id] ?? null;
      if (existing) {
        return existing;
      }

      if (!currencyFormatter) {
        return null;
      }

      const breakdown = calculateVideoCost(video);
      return breakdown ? buildCostSummary(breakdown, currencyFormatter) : null;
    })();

    const estimatedPreferred = summary?.estimatedDisplay.preferred ?? null;
    const estimatedUsd = summary ? formatUsd(summary.estimatedUsd) : null;
    const actualPreferred = summary?.actualDisplay.preferred ?? null;
    const actualUsd = summary?.actualUsd !== null && summary?.actualUsd !== undefined ? formatUsd(summary.actualUsd) : null;

    return {
      id: video.id,
      status: video.status,
      statusLabel: translate(`status.${video.status}` as Parameters<TranslateFn>[0]),
      progress: Number.parseFloat(video.progress.toFixed(2)),
      model: video.model,
      durationSeconds: Number(video.seconds ?? 0),
      resolution: video.size,
      createdAtIso: createdAt.toISOString(),
      createdAtLocal: createdAt.toLocaleString(),
      estimatedPreferred,
      estimatedUsd,
      actualPreferred,
      actualUsd,
      preferredCurrency: summary?.preferredCurrency ?? currencyFormatter?.currency ?? null,
    } satisfies VideoCsvRow;
  });
};

export const generateDefaultExportPath = (directory: string = process.cwd()) => {
  const now = new Date();
  const pad = (value: number) => value.toString().padStart(2, '0');
  const fileName = `skypilot_videos_${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}.csv`;
  return path.resolve(directory, fileName);
};

export const buildVideoCsv = (
  videos: readonly SoraVideo[],
  summaries: Record<string, CostSummary | null>,
  translate: TranslateFn,
  currencyFormatter: CurrencyFormatter | null,
) => {
  const rows = buildVideoCsvRows(videos, summaries, translate, currencyFormatter);
  return serializeRows(rows);
};

export const exportVideosToCsv = async (
  videos: readonly SoraVideo[],
  summaries: Record<string, CostSummary | null>,
  translate: TranslateFn,
  currencyFormatter: CurrencyFormatter | null,
  destination?: string,
) => {
  const targetPath = destination ? path.resolve(destination) : generateDefaultExportPath();
  const csv = buildVideoCsv(videos, summaries, translate, currencyFormatter);
  await writeFile(targetPath, csv, 'utf8');
  return targetPath;
};
