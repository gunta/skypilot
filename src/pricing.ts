import type { SoraVideo } from './api';
import { formatUsd, getCurrencyFormatter } from './currency';
import type { CurrencyFormatter } from './currency';

const PRICING_TABLE: Array<{
  model: SoraVideo['model'];
  sizes: Set<SoraVideo['size']>;
  pricePerSecondUsd: number;
}> = [
  {
    model: 'sora-2',
    sizes: new Set(['720x1280', '1280x720'] as SoraVideo['size'][]),
    pricePerSecondUsd: 0.1,
  },
  {
    model: 'sora-2-pro',
    sizes: new Set(['720x1280', '1280x720'] as SoraVideo['size'][]),
    pricePerSecondUsd: 0.3,
  },
  {
    model: 'sora-2-pro',
    sizes: new Set(['1024x1792', '1792x1024'] as SoraVideo['size'][]),
    pricePerSecondUsd: 0.5,
  },
];

const getPricePerSecondUsd = (model: SoraVideo['model'], size: SoraVideo['size']): number | null => {
  for (const entry of PRICING_TABLE) {
    if (entry.model === model && entry.sizes.has(size)) {
      return entry.pricePerSecondUsd;
    }
  }
  return null;
};

export interface CostBreakdown {
  pricePerSecondUsd: number;
  estimatedUsd: number;
  actualUsd: number | null;
}

export const calculateVideoCost = (
  video: Pick<SoraVideo, 'model' | 'size' | 'seconds' | 'status'>,
): CostBreakdown | null => {
  const pricePerSecondUsd = getPricePerSecondUsd(video.model, video.size);
  if (pricePerSecondUsd === null) {
    return null;
  }

  const secondsValue = Number.parseFloat(String(video.seconds ?? '0'));
  if (!Number.isFinite(secondsValue) || secondsValue <= 0) {
    return {
      pricePerSecondUsd,
      estimatedUsd: 0,
      actualUsd: video.status === 'completed' ? 0 : null,
    };
  }

  const estimatedUsd = pricePerSecondUsd * secondsValue;
  let actualUsd: number | null = null;

  if (video.status === 'completed') {
    actualUsd = estimatedUsd;
  } else if (video.status === 'failed') {
    actualUsd = 0;
  }

  return { pricePerSecondUsd, estimatedUsd, actualUsd };
};

export interface CostSummary {
  estimatedUsd: number;
  actualUsd: number | null;
  estimatedDisplay: {
    usd: string;
    preferred: string;
  };
  actualDisplay: {
    usd: string | null;
    preferred: string | null;
  };
  pricePerSecondUsd: number;
  preferredCurrency: string;
}

export const buildCostSummary = (
  breakdown: CostBreakdown,
  formatter: CurrencyFormatter,
): CostSummary => {
  const estimatedUsd = breakdown.estimatedUsd;
  const actualUsd = breakdown.actualUsd;

  return {
    estimatedUsd,
    actualUsd,
    estimatedDisplay: {
      usd: formatUsd(estimatedUsd),
      preferred: formatter.format(estimatedUsd),
    },
    actualDisplay: {
      usd: typeof actualUsd === 'number' ? formatUsd(actualUsd) : null,
      preferred: typeof actualUsd === 'number' ? formatter.format(actualUsd) : null,
    },
    pricePerSecondUsd: breakdown.pricePerSecondUsd,
    preferredCurrency: formatter.currency,
  };
};

export const calculateAndSummarizeCost = async (
  video: Pick<SoraVideo, 'model' | 'size' | 'seconds' | 'status'>,
): Promise<CostSummary | null> => {
  const breakdown = calculateVideoCost(video);
  if (!breakdown) {
    return null;
  }

  const formatter = await getCurrencyFormatter();
  return buildCostSummary(breakdown, formatter);
};
