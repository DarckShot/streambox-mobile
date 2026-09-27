import { useCallback, useMemo } from 'react';
import type { OnLoadData, OnProgressData } from 'react-native-video';

import type { usePlayerFullscreen } from './usePlayerFullscreen';
import type { useRutubePlayer } from './useRutubePlayer';
import type { useServerVideoProgress } from './useServerVideoProgress';

interface VideoPlaybackEventsOptions {
  fullscreen: ReturnType<typeof usePlayerFullscreen>['actions'];
  progress: ReturnType<typeof useServerVideoProgress>['actions'];
  ready: boolean;
  recordMediaLoad: (duration: number) => void;
  seekTo: (time: number) => void;
  videoEvents: ReturnType<typeof useRutubePlayer>['videoEvents'];
}

interface VideoPlaybackEvents {
  onEnd: () => void;
  onLoad: (data: OnLoadData) => void;
  onProgress: (data: OnProgressData) => void;
}

export const useVideoPlaybackEvents = ({
  fullscreen,
  progress,
  ready,
  recordMediaLoad,
  seekTo,
  videoEvents,
}: VideoPlaybackEventsOptions): VideoPlaybackEvents => {
  const onLoad = useCallback(
    (data: OnLoadData): void => {
      videoEvents.onLoad(data);
      progress.setDuration(data.duration);
      recordMediaLoad(data.duration);

      const restorePosition = fullscreen.consumeRestorePosition();

      if (restorePosition !== null) {
        seekTo(restorePosition);
      }
    },
    [fullscreen, progress, recordMediaLoad, seekTo, videoEvents],
  );

  const onProgress = useCallback(
    (data: OnProgressData): void => {
      videoEvents.onProgress(data);

      if (ready) {
        progress.recordProgress(data.currentTime);
      }
    },
    [progress, ready, videoEvents],
  );

  const onEnd = useCallback((): void => {
    progress.complete();
    videoEvents.onEnd();
  }, [progress, videoEvents]);

  return useMemo(() => ({ onEnd, onLoad, onProgress }), [onEnd, onLoad, onProgress]);
};
