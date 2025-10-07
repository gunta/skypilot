import {
  ALL_VIDEO_ASSET_VARIANTS,
  downloadVideoAsset,
  downloadVideoAssets,
  type VideoAssetVariant,
} from '../api.js';
import type { AssetVariant } from './constants.js';

export interface AssetDownloadResult {
  variant: AssetVariant;
  variants: VideoAssetVariant[];
  paths: string[];
}

const BUNDLED_VARIANTS: VideoAssetVariant[] = ['video', 'thumbnail'];

export const downloadAssetsForVariant = async (
  videoId: string,
  variant: AssetVariant,
): Promise<AssetDownloadResult> => {
  if (variant === 'all') {
    const variants = [...ALL_VIDEO_ASSET_VARIANTS];
    const paths = await downloadVideoAssets(videoId, variants);
    return { variant, variants, paths };
  }

  if (variant === 'video_and_thumbnail') {
    const paths = await downloadVideoAssets(videoId, BUNDLED_VARIANTS);
    return { variant, variants: BUNDLED_VARIANTS, paths };
  }

  const path = await downloadVideoAsset(videoId, { variant });
  return { variant, variants: [variant], paths: [path] };
};
