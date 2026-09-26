import { useIsFocused, usePreventRemove } from '@react-navigation/native';
import { memo, useCallback, useMemo, useRef, type ReactElement } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { Modal, Pressable, StatusBar, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Video, { ResizeMode, type OnLoadData, type VideoRef } from 'react-native-video';

import { usePlayerFullscreen } from '../../hooks/usePlayerFullscreen';
import { usePlayerControls } from '../../hooks/usePlayerControls';
import { useRutubePlayer } from '../../hooks/useRutubePlayer';
import { clampPlaybackTime } from '../../utils/clampPlaybackTime';
import BasicVideoPlayer from './BasicVideoPlayer';
import { rutubeVideoPlayerStyles as styles } from './RutubeVideoPlayer.styles';
import VideoControls from './VideoControls';

interface RutubeVideoPlayerProps {
  containerStyle?: StyleProp<ViewStyle>;
  externalId: string;
  posterUrl: string;
}

const RutubeVideoPlayer = ({
  containerStyle,
  externalId,
  posterUrl,
}: RutubeVideoPlayerProps): ReactElement => {
  const isFocused = useIsFocused();
  const videoRef = useRef<VideoRef>(null);
  const {
    actions: playerActions,
    state: player,
    videoEvents,
  } = useRutubePlayer(externalId, isFocused);
  const canShowControls = player.hasStarted && player.status !== 'ended';
  const { actions: controlsActions, state: controls } = usePlayerControls(canShowControls);
  const { actions: fullscreenActions, state: fullscreen } = usePlayerFullscreen(
    player.currentTime,
    player.hasStarted && isFocused,
  );
  usePreventRemove(fullscreen.mounted, fullscreenActions.close);
  const startPosition = fullscreen.mounted
    ? fullscreen.modalStartPosition
    : fullscreen.inlineStartPosition;
  const videoSource = useMemo(
    () => ({ uri: player.playbackUrl ?? undefined, startPosition }),
    [player.playbackUrl, startPosition],
  );

  const handlePlaybackPress = useCallback((): void => {
    if (player.status === 'ended') {
      fullscreenActions.resetStartPosition();
    }

    playerActions.togglePlayback();
  }, [fullscreenActions, player.status, playerActions]);

  const handleRetryPress = useCallback((): void => {
    fullscreenActions.resetStartPosition();
    playerActions.retry();
  }, [fullscreenActions, playerActions]);

  const handleSeek = useCallback(
    (time: number): void => {
      const nextTime = clampPlaybackTime(time, player.duration);
      videoRef.current?.seek(nextTime);
      playerActions.seek(nextTime);
    },
    [player.duration, playerActions],
  );

  const handleVideoLoad = useCallback(
    (data: OnLoadData): void => {
      videoEvents.onLoad(data);
      const restorePosition = fullscreenActions.consumeRestorePosition();

      if (restorePosition !== null) {
        videoRef.current?.seek(restorePosition);
        playerActions.seek(restorePosition);
      }
    },
    [fullscreenActions, playerActions, videoEvents],
  );

  const playerSurface = player.playbackUrl ? (
    <View style={styles.media}>
      <Video
        ref={videoRef}
        key={player.mediaKey}
        muted={player.isMuted}
        onBuffer={videoEvents.onBuffer}
        onEnd={videoEvents.onEnd}
        onError={videoEvents.onError}
        onLoad={handleVideoLoad}
        onProgress={videoEvents.onProgress}
        paused={player.isPaused}
        poster={{
          source: { uri: posterUrl },
          resizeMode: fullscreen.mounted ? ResizeMode.CONTAIN : ResizeMode.COVER,
        }}
        resizeMode={fullscreen.mounted ? ResizeMode.CONTAIN : ResizeMode.COVER}
        source={videoSource}
        style={styles.video}
      />

      {canShowControls ? (
        <Pressable
          accessibilityLabel={controls.visible ? 'Скрыть управление' : 'Показать управление'}
          accessibilityRole="button"
          onPress={controlsActions.toggle}
          style={styles.controlsSurface}
        />
      ) : null}

      {controls.visible && canShowControls ? (
        <VideoControls
          currentTime={player.currentTime}
          duration={player.duration}
          fullscreen={fullscreen.mounted}
          isMuted={player.isMuted}
          isPaused={player.isPaused}
          onFullscreenPress={fullscreenActions.toggle}
          onInteraction={controlsActions.show}
          onMutePress={playerActions.toggleMute}
          onPlaybackPress={handlePlaybackPress}
          onSeek={handleSeek}
          onSeekStart={controlsActions.keepVisible}
        />
      ) : null}
    </View>
  ) : null;

  return (
    <>
      <BasicVideoPlayer
        containerStyle={containerStyle}
        errorDescription={player.errorMessage ?? 'Не удалось получить ссылку на видеопоток.'}
        media={fullscreen.mounted ? undefined : playerSurface}
        onErrorActionPress={handleRetryPress}
        onPlaybackPress={handlePlaybackPress}
        posterUrl={posterUrl}
        status={player.status}
      />

      <Modal
        animationType="none"
        onDismiss={fullscreenActions.handleDismiss}
        onRequestClose={fullscreenActions.close}
        navigationBarTranslucent
        presentationStyle="fullScreen"
        statusBarTranslucent
        supportedOrientations={['portrait', 'landscape-left', 'landscape-right']}
        visible={fullscreen.visible}
      >
        <StatusBar hidden />
        <SafeAreaProvider style={styles.fullscreen}>
          <BasicVideoPlayer
            containerStyle={styles.fullscreenFrame}
            errorDescription={player.errorMessage ?? 'Не удалось получить ссылку на видеопоток.'}
            media={playerSurface}
            onErrorActionPress={handleRetryPress}
            onPlaybackPress={handlePlaybackPress}
            posterUrl={posterUrl}
            status={player.status}
          />
        </SafeAreaProvider>
      </Modal>
    </>
  );
};

export default memo(RutubeVideoPlayer);
