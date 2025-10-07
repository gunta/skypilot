import { ALL_VIDEO_ASSET_VARIANTS, downloadVideoAsset, downloadVideoAssets, type VideoAssetVariant } from './api.js';

export const ASSET_CHOICES = ['video_and_thumbnail', ...ALL_VIDEO_ASSET_VARIANTS, 'all'] as const;
export type AssetChoice = (typeof ASSET_CHOICES)[number];

const BUNDLED_VARIANTS: readonly VideoAssetVariant[] = ['video', 'thumbnail'];

export interface DownloadedAssetEntry {
  variant: VideoAssetVariant;
  path: string;
}

export interface DownloadedAssetsSummary {
  choice: AssetChoice;
  entries: DownloadedAssetEntry[];
}

export const resolveVariantsForChoice = (choice: AssetChoice): readonly VideoAssetVariant[] => {
  if (choice === 'all') {
    return ALL_VIDEO_ASSET_VARIANTS;
  }

  if (choice === 'video_and_thumbnail') {
    return BUNDLED_VARIANTS;
  }

  return [choice];
};

export interface DownloadAssetsOptions {
  destination?: string;
  mkdirp?: boolean;
}

export const downloadAssetsForChoice = async (
  videoId: string,
  choice: AssetChoice,
  { destination, mkdirp = true }: DownloadAssetsOptions = {},
): Promise<DownloadedAssetsSummary> => {
  if (choice === 'all') {
    const variants = [...ALL_VIDEO_ASSET_VARIANTS];
    const paths = await downloadVideoAssets(videoId, variants, { destination, mkdirp });
    const entries = variants.map((variant, index) => ({ variant, path: paths[index]! }));
    return { choice, entries };
  }

  if (choice === 'video_and_thumbnail') {
    const variants = [...BUNDLED_VARIANTS];
    const paths = await downloadVideoAssets(videoId, variants, { destination, mkdirp });
    const entries = variants.map((variant, index) => ({ variant, path: paths[index]! }));
    return { choice, entries };
  }

  const path = await downloadVideoAsset(videoId, { variant: choice, destination, mkdirp });
  return {
    choice,
    entries: [
      {
        variant: choice,
        path,
      },
    ],
  };
};
