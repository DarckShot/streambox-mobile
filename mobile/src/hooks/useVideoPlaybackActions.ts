import { useCallback, useMemo, type RefObject } from 'react';
import type { VideoRef } from 'react-native-video';

import { clampPlaybackTime } from '../utils/clampPlaybackTime';
import type { usePlayerFullscreen } from './usePlayerFullscreen';
import type { useRutubePlayer } from './useRutubePlayer';
import type { useVideoProgress } from './useVideoProgress';

interface VideoPlaybackActionsOptions {
  autoPlayOnRestore: boolean;
  fullscreen: ReturnType<typeof usePlayerFullscreen>['actions'];
  player: ReturnType<typeof useRutubePlayer>['state'];
  playerActions: ReturnType<typeof useRutubePlayer>['actions'];
  progress: ReturnType<typeof useVideoProgress>['actions'];
  videoRef: RefObject<VideoRef | null>;
}

interface VideoPlaybackActions {
  discardSavedPosition: () => void;
  onPlaybackPress: () => void;
  onRetryPress: () => void;
  onSeek: (time: number) => void;
  restoreSavedPosition: (position: number) => void;
  seekTo: (time: number) => void;
}

export const useVideoPlaybackActions = ({
  autoPlayOnRestore,
  fullscreen,
  player,
  playerActions,
  progress,
  videoRef,
}: VideoPlaybackActionsOptions): VideoPlaybackActions => {
  const seekTo = useCallback(
    (time: number): void => {
      videoRef.current?.seek(time);
      playerActions.seek(time);
      progress.recordSeek(time);
    },
    [playerActions, progress, videoRef],
  );

  const onSeek = useCallback(
    (time: number): void => {
      seekTo(clampPlaybackTime(time, player.duration));
    },
    [player.duration, seekTo],
  );

  const restoreSavedPosition = useCallback(
    (position: number): void => {
      seekTo(position);
      if (autoPlayOnRestore) playerActions.togglePlayback();
    },
    [autoPlayOnRestore, playerActions, seekTo],
  );

  const discardSavedPosition = useCallback((): void => {
    progress.discard();
    videoRef.current?.seek(0);
    playerActions.seek(0);
  }, [playerActions, progress, videoRef]);

  const onPlaybackPress = useCallback((): void => {
    if (player.status === 'ended') {
      fullscreen.resetStartPosition();
      progress.beginReplay();
    } else if (!player.isPaused) {
      progress.flush();
    }

    playerActions.togglePlayback();
  }, [fullscreen, player.isPaused, player.status, playerActions, progress]);

  const onRetryPress = useCallback((): void => {
    progress.flush();
    fullscreen.resetStartPosition();
    playerActions.retry();
  }, [fullscreen, playerActions, progress]);

  return useMemo(
    () => ({
      discardSavedPosition,
      onPlaybackPress,
      onRetryPress,
      onSeek,
      restoreSavedPosition,
      seekTo,
    }),
    [discardSavedPosition, onPlaybackPress, onRetryPress, onSeek, restoreSavedPosition, seekTo],
  );
};
