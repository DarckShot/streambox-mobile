import { useIsFocused, usePreventRemove } from '@react-navigation/native';
import { useEffect, useMemo, useRef, type RefObject } from 'react';
import type { OnLoadData, OnProgressData, VideoRef } from 'react-native-video';

import type { BasicVideoPlayerStatus } from '../types/player';
import { useInitialPlaybackResume } from './useInitialPlaybackResume';
import { usePlayerControls } from './usePlayerControls';
import { usePlayerFullscreen } from './usePlayerFullscreen';
import { useRutubePlayer } from './useRutubePlayer';
import { useVideoPlaybackActions } from './useVideoPlaybackActions';
import { useVideoPlaybackEvents } from './useVideoPlaybackEvents';
import { useVideoProgress } from './useVideoProgress';
import { usePlaybackSettingsStore } from '../store/usePlaybackSettingsStore';

interface UseRutubeVideoPlaybackOptions {
  autoPlayOnOpen?: boolean;
  videoId: string;
}

export interface RutubeVideoPlayback {
  canShowControls: boolean;
  controls: ReturnType<typeof usePlayerControls>;
  fullscreen: ReturnType<typeof usePlayerFullscreen>;
  mediaReady: boolean;
  handlers: {
    onEnd: () => void;
    onLoad: (data: OnLoadData) => void;
    onMutePress: () => void;
    onPlaybackPress: () => void;
    onProgress: (data: OnProgressData) => void;
    onRetryPress: () => void;
    onSeek: (time: number) => void;
  };
  player: ReturnType<typeof useRutubePlayer>['state'];
  source: { uri: string | undefined; startPosition: number };
  status: BasicVideoPlayerStatus;
  videoEvents: ReturnType<typeof useRutubePlayer>['videoEvents'];
  videoRef: RefObject<VideoRef | null>;
}

export const useRutubeVideoPlayback = ({
  autoPlayOnOpen = false,
  videoId,
}: UseRutubeVideoPlaybackOptions): RutubeVideoPlayback => {
  const isFocused = useIsFocused();
  const videoRef = useRef<VideoRef>(null);
  const initialStartPositionRef = useRef<number | null>(null);
  const autoStartedRef = useRef(false);
  const autoPlayOnResume = usePlaybackSettingsStore((state) => state.autoPlayOnResume);
  const settingsLoaded = usePlaybackSettingsStore((state) => state.loaded);
  useEffect(() => {
    usePlaybackSettingsStore.getState().loadSettings();
  }, []);
  const {
    actions: playerActions,
    state: player,
    videoEvents,
  } = useRutubePlayer(videoId, isFocused);
  const { actions: progressActions, saved } = useVideoProgress(videoId, isFocused);
  if (saved.loaded && initialStartPositionRef.current === null) {
    initialStartPositionRef.current = Math.round((saved.position ?? 0) * 1000);
  }
  const canShowControls = player.hasStarted && player.status !== 'ended';
  const controls = usePlayerControls(canShowControls);
  const fullscreen = usePlayerFullscreen(player.currentTime, player.hasStarted && isFocused);
  usePreventRemove(fullscreen.state.mounted, fullscreen.actions.close);

  const actions = useVideoPlaybackActions({
    autoPlayOnRestore: autoPlayOnOpen || autoPlayOnResume,
    fullscreen: fullscreen.actions,
    player,
    playerActions,
    progress: progressActions,
    videoRef,
  });
  const { ready: resumeReady, recordMediaLoad } = useInitialPlaybackResume({
    isFocused,
    onDiscard: actions.discardSavedPosition,
    onRestore: actions.restoreSavedPosition,
    saved: { ...saved, loaded: saved.loaded && settingsLoaded },
  });
  const events = useVideoPlaybackEvents({
    fullscreen: fullscreen.actions,
    progress: progressActions,
    ready: resumeReady,
    recordMediaLoad,
    seekTo: actions.seekTo,
    videoEvents,
  });

  const startPosition = fullscreen.state.mounted
    ? fullscreen.state.modalStartPosition
    : fullscreen.state.inlineStartPosition ?? initialStartPositionRef.current ?? 0;
  const source = useMemo(
    () => ({ uri: player.playbackUrl ?? undefined, startPosition }),
    [player.playbackUrl, startPosition],
  );
  const status = resumeReady || player.status === 'error' ? player.status : 'loading';

  useEffect(() => {
    if (
      !autoPlayOnOpen ||
      autoStartedRef.current ||
      !resumeReady ||
      !isFocused ||
      saved.position !== null ||
      player.hasStarted ||
      !player.playbackUrl
    )
      return;
    autoStartedRef.current = true;
    playerActions.togglePlayback();
  }, [
    autoPlayOnOpen,
    isFocused,
    player.hasStarted,
    player.playbackUrl,
    playerActions,
    resumeReady,
    saved.position,
  ]);

  return {
    canShowControls,
    controls,
    fullscreen,
    handlers: {
      onEnd: events.onEnd,
      onLoad: events.onLoad,
      onMutePress: playerActions.toggleMute,
      onPlaybackPress: actions.onPlaybackPress,
      onProgress: events.onProgress,
      onRetryPress: actions.onRetryPress,
      onSeek: actions.onSeek,
    },
    mediaReady: saved.loaded && settingsLoaded,
    player,
    source,
    status,
    videoEvents,
    videoRef,
  };
};
