import { useCallback } from 'react';

import { PLAYER_SEEK_STEP_SECONDS } from '../../constants/player';

interface UseVideoControlActionsParams {
  currentTime: number;
  onFullscreenPress: () => void;
  onInteraction: () => void;
  onMutePress: () => void;
  onPlaybackPress: () => void;
  onSeek: (time: number) => void;
}

interface VideoControlActions {
  seekBackward: () => void;
  seekForward: () => void;
  toggleFullscreen: () => void;
  toggleMute: () => void;
  togglePlayback: () => void;
}

export const useVideoControlActions = ({
  currentTime,
  onFullscreenPress,
  onInteraction,
  onMutePress,
  onPlaybackPress,
  onSeek,
}: UseVideoControlActionsParams): VideoControlActions => {
  const togglePlayback = useCallback((): void => {
    onPlaybackPress();
    onInteraction();
  }, [onInteraction, onPlaybackPress]);

  const seekBackward = useCallback((): void => {
    onSeek(currentTime - PLAYER_SEEK_STEP_SECONDS);
    onInteraction();
  }, [currentTime, onInteraction, onSeek]);

  const seekForward = useCallback((): void => {
    onSeek(currentTime + PLAYER_SEEK_STEP_SECONDS);
    onInteraction();
  }, [currentTime, onInteraction, onSeek]);

  const toggleMute = useCallback((): void => {
    onMutePress();
    onInteraction();
  }, [onInteraction, onMutePress]);

  const toggleFullscreen = useCallback((): void => {
    onFullscreenPress();
    onInteraction();
  }, [onFullscreenPress, onInteraction]);

  return {
    seekBackward,
    seekForward,
    toggleFullscreen,
    toggleMute,
    togglePlayback,
  };
};
