import { useCallback, useEffect, useMemo, useReducer } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type {
  OnBufferData,
  OnLoadData,
  OnProgressData,
  OnVideoErrorData,
} from 'react-native-video';

import { getVideoPlaybackUrl } from '../api/videos';
import { videoKeys } from '../api/videoQueries';
import type { BasicVideoPlayerStatus } from '../types/player';
import { INITIAL_RUTUBE_PLAYER_STATE, rutubePlayerReducer } from './useRutubePlayer.reducer';
import { useOnline } from '../services/networkState';
import { toApiError } from '../api/client';

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

const getPlaybackErrorMessage = (_data: OnVideoErrorData): string =>
  'Не удалось воспроизвести видео. Проверьте соединение и попробуйте ещё раз.';

export const useRutubePlayer = (videoId: string, isActive: boolean): UseRutubePlayerResult => {
  const queryClient = useQueryClient();
  const online = useOnline();
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

    if (!online) {
      dispatch({
        type: 'loadFailed',
        errorMessage: 'Нет подключения. Видео доступно только онлайн.',
      });
      return () => controller.abort();
    }

    const loadPlaybackUrl = async (): Promise<void> => {
      dispatch({ type: 'loadRequested' });

      try {
        const url = await queryClient.fetchQuery({
          queryKey: videoKeys.playback(videoId),
          queryFn: ({ signal }) => getVideoPlaybackUrl(videoId, signal),
          staleTime: 0,
          gcTime: 0,
        });

        if (!controller.signal.aborted) {
          dispatch({ type: 'loadSucceeded', playbackUrl: url });
        }
      } catch (error: unknown) {
        if (!controller.signal.aborted) {
          dispatch({
            type: 'loadFailed',
            errorMessage: toApiError(error).message,
          });
        }
      }
    };

    loadPlaybackUrl();

    return () => {
      controller.abort();
      queryClient.cancelQueries({ queryKey: videoKeys.playback(videoId) });
    };
  }, [queryClient, videoId, reloadKey, online]);

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
