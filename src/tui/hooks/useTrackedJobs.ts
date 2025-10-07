import { useCallback, useMemo, useState } from 'react';

import type { SoraVideo } from '../../api.js';
import { buildCostSummary, calculateVideoCost } from '../../pricing.js';
import type { CurrencyFormatter } from '../../currency.js';
import { MAX_TRACKED_JOBS } from '../constants.js';
import type { TrackedJob } from '../types.js';

interface UseTrackedJobsParams {
  currencyFormatter: CurrencyFormatter | null;
}

export const useTrackedJobs = ({ currencyFormatter }: UseTrackedJobsParams) => {
  const [trackedJobs, setTrackedJobs] = useState<TrackedJob[]>([]);

  const upsertTrackedJob = useCallback((video: SoraVideo) => {
    setTrackedJobs((current) => {
      const index = current.findIndex((job) => job.video.id === video.id);
      if (index === -1) {
        const next = [...current, { video, startedAt: Date.now() }];
        if (next.length <= MAX_TRACKED_JOBS) {
          return next;
        }
        return next.slice(next.length - MAX_TRACKED_JOBS);
      }

      const copy = [...current];
      const existing = copy[index]!;
      copy[index] = { ...existing, video };
      return copy;
    });
  }, []);

  const removeTrackedJob = useCallback((videoId: string) => {
    setTrackedJobs((current) => current.filter((job) => job.video.id !== videoId));
  }, []);

  const sortedTrackedJobs = useMemo(
    () => [...trackedJobs].sort((a, b) => b.startedAt - a.startedAt),
    [trackedJobs],
  );

  const trackedSummaries = useMemo(() => {
    const summaries = new Map<string, ReturnType<typeof buildCostSummary> | null>();
    if (!currencyFormatter) {
      return summaries;
    }

    for (const { video } of trackedJobs) {
      const breakdown = calculateVideoCost(video);
      summaries.set(video.id, breakdown ? buildCostSummary(breakdown, currencyFormatter) : null);
    }

    return summaries;
  }, [currencyFormatter, trackedJobs]);

  return {
    trackedJobs,
    sortedTrackedJobs,
    trackedSummaries,
    upsertTrackedJob,
    removeTrackedJob,
    setTrackedJobs,
  };
};
