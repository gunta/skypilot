import path from 'node:path';
import { readFile } from 'node:fs/promises';

import { useCallback, useState } from 'react';

import { translate } from '@/shared/translation.js';
import { wrapForTmux, supportsItermInlineImages, makeItermPayload } from '../terminal.js';

interface ThumbnailPreviewState {
  preview: string | null;
  label: string | null;
  error: string | null;
}

interface ThumbnailPreviewControls extends ThumbnailPreviewState {
  showThumbnail: (filePath: string) => Promise<boolean>;
  resetPreview: () => void;
}

export const useThumbnailPreview = (): ThumbnailPreviewControls => {
  const [state, setState] = useState<ThumbnailPreviewState>({
    preview: null,
    label: null,
    error: null,
  });

  const resetPreview = useCallback(() => {
    setState({ preview: null, label: null, error: null });
  }, []);

  const showThumbnail = useCallback(async (filePath: string) => {
    const absolutePath = path.resolve(filePath);

    try {
      const fileName = path.basename(absolutePath);
      const data = await readFile(absolutePath);
      const base64 = data.toString('base64');

      if (supportsItermInlineImages()) {
        const payload = makeItermPayload(fileName, base64);
        setState({ preview: wrapForTmux(payload), label: fileName, error: null });
        return true;
      }

      setState({ preview: null, label: fileName, error: translate('app.thumbnailPreviewUnsupported') });
      return false;
    } catch (error) {
      setState({
        preview: null,
        label: null,
        error: translate('app.thumbnailPreviewFailed', { message: (error as Error).message }),
      });
      return false;
    }
  }, []);

  return {
    preview: state.preview,
    label: state.label,
    error: state.error,
    showThumbnail,
    resetPreview,
  };
};
