import { useCallback, useEffect, useMemo, useReducer } from 'react';
import type {
  OnBufferData,
  OnLoadData,
  OnProgressData,
  OnVideoErrorData,
} from 'react-native-video';

import { getRutubePlaybackUrl } from '../api/rutube';
import type { BasicVideoPlayerStatus } from '../types/player';
import { INITIAL_RUTUBE_PLAYER_STATE, rutubePlayerReducer } from './useRutubePlayer.reducer';

interface RutubePlayerState {
  currentTime: number;
  duration: number;
  errorMessage: string | null;
  hasStarted: boolean;
  isMuted: boolean;
  isPaused: boolean;
  mediaKey: number;
  playbackUrl: string | null;
  status: BasicVideoPlayerStatus;
}

interface RutubePlayerActions {
  retry: () => void;
  seek: (time: number) => void;
  toggleMute: () => void;
  togglePlayback: () => void;
}

interface RutubePlayerVideoEvents {
  onBuffer: (data: OnBufferData) => void;
  onEnd: () => void;
  onError: (data: OnVideoErrorData) => void;
  onLoad: (data: OnLoadData) => void;
  onProgress: (data: OnProgressData) => void;
}

interface UseRutubePlayerResult {
  actions: RutubePlayerActions;
  state: RutubePlayerState;
  videoEvents: RutubePlayerVideoEvents;
}

const getPlaybackErrorMessage = (data: OnVideoErrorData): string => {
  const message =
    data.error.localizedDescription ??
    data.error.localizedFailureReason ??
    data.error.errorString ??
    data.error.error;

  return message ? `Ошибка воспроизведения: ${message}` : 'Не удалось воспроизвести видео.';
};

export const useRutubePlayer = (externalId: string, isActive: boolean): UseRutubePlayerResult => {
  const [state, dispatch] = useReducer(rutubePlayerReducer, INITIAL_RUTUBE_PLAYER_STATE);
  const {
    currentTime,
    duration,
    errorMessage,
    hasStarted,
    isMuted,
    isPaused,
    mediaKey,
    playbackUrl,
    reloadKey,
    status,
  } = state;

  useEffect(() => {
    const controller = new AbortController();

    const loadPlaybackUrl = async (): Promise<void> => {
      dispatch({ type: 'loadRequested' });

      try {
        const url = await getRutubePlaybackUrl(externalId, controller.signal);

        if (!controller.signal.aborted) {
          dispatch({ type: 'loadSucceeded', playbackUrl: url });
        }
      } catch (error: unknown) {
        if (!controller.signal.aborted) {
          dispatch({
            type: 'loadFailed',
            errorMessage: error instanceof Error ? error.message : 'Не удалось загрузить видео.',
          });
        }
      }
    };

    loadPlaybackUrl();

    return () => {
      controller.abort();
    };
  }, [externalId, reloadKey]);

  useEffect(() => {
    if (!isActive) {
      dispatch({ type: 'deactivated' });
    }
  }, [isActive]);

  const handlePlaybackPress = useCallback((): void => {
    dispatch({ type: 'playbackPressed' });
  }, []);

  const handleLoad = useCallback(
    ({ currentTime: loadedTime, duration: loadedDuration }: OnLoadData): void => {
      dispatch({ type: 'mediaLoaded', currentTime: loadedTime, duration: loadedDuration });
    },
    [],
  );

  const handleProgress = useCallback(({ currentTime: nextTime }: OnProgressData): void => {
    dispatch({ type: 'progressChanged', currentTime: nextTime });
  }, []);

  const handleBuffer = useCallback(({ isBuffering }: OnBufferData): void => {
    dispatch({ type: 'bufferChanged', isBuffering });
  }, []);

  const handleEnd = useCallback((): void => {
    dispatch({ type: 'playbackEnded' });
  }, []);

  const handleSeek = useCallback((time: number): void => {
    dispatch({ type: 'seekRequested', currentTime: time });
  }, []);

  const handleMutePress = useCallback((): void => {
    dispatch({ type: 'mutePressed' });
  }, []);

  const handleError = useCallback((data: OnVideoErrorData): void => {
    dispatch({ type: 'playbackFailed', errorMessage: getPlaybackErrorMessage(data) });
  }, []);

  const handleRetryPress = useCallback((): void => {
    dispatch({ type: 'retryPressed' });
  }, []);

  const actions = useMemo<RutubePlayerActions>(
    () => ({
      retry: handleRetryPress,
      seek: handleSeek,
      toggleMute: handleMutePress,
      togglePlayback: handlePlaybackPress,
    }),
    [handleMutePress, handlePlaybackPress, handleRetryPress, handleSeek],
  );
  const videoEvents = useMemo<RutubePlayerVideoEvents>(
    () => ({
      onBuffer: handleBuffer,
      onEnd: handleEnd,
      onError: handleError,
      onLoad: handleLoad,
      onProgress: handleProgress,
    }),
    [handleBuffer, handleEnd, handleError, handleLoad, handleProgress],
  );

  return {
    actions,
    state: {
      currentTime,
      duration,
      errorMessage,
      hasStarted,
      isMuted,
      isPaused,
      mediaKey,
      playbackUrl,
      status,
    },
    videoEvents,
  };
};
