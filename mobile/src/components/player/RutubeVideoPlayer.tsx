import { useIsFocused } from '@react-navigation/native';
import { memo, useCallback, useRef, type ReactElement } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { Modal, Pressable, StatusBar, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Video, { ResizeMode, type OnLoadData, type VideoRef } from 'react-native-video';

import { usePlayerFullscreen } from '../../hooks/usePlayerFullscreen';
import { usePlayerControls } from '../../hooks/usePlayerControls';
import { useRutubePlayer } from '../../hooks/useRutubePlayer';
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
  const { actions: controlsActions, state: controls } = usePlayerControls(
    player.hasStarted,
    player.isPaused,
  );
  const { actions: fullscreenActions, state: fullscreen } = usePlayerFullscreen(
    player.currentTime,
    player.hasStarted && isFocused,
  );

  const handleSeek = useCallback(
    (time: number): void => {
      videoRef.current?.seek(time);
      playerActions.seek(time);
    },
    [playerActions],
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
        source={{ uri: player.playbackUrl }}
        style={styles.video}
      />

      {player.hasStarted ? (
        <Pressable
          accessibilityLabel={controls.visible ? 'Скрыть управление' : 'Показать управление'}
          accessibilityRole="button"
          onPress={controlsActions.toggle}
          style={styles.controlsSurface}
        />
      ) : null}

      {controls.visible && player.hasStarted ? (
        <VideoControls
          currentTime={player.currentTime}
          duration={player.duration}
          fullscreen={fullscreen.mounted}
          isMuted={player.isMuted}
          isPaused={player.isPaused}
          onFullscreenPress={fullscreenActions.toggle}
          onInteraction={controlsActions.show}
          onMutePress={playerActions.toggleMute}
          onPlaybackPress={playerActions.togglePlayback}
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
        onErrorActionPress={playerActions.retry}
        onPlaybackPress={playerActions.togglePlayback}
        posterUrl={posterUrl}
        status={player.status}
      />

      <Modal
        animationType="none"
        onDismiss={fullscreenActions.handleDismiss}
        onRequestClose={fullscreenActions.toggle}
        presentationStyle="fullScreen"
        statusBarTranslucent
        supportedOrientations={['portrait', 'landscape-left', 'landscape-right']}
        visible={fullscreen.visible}
      >
        <StatusBar hidden />
        <SafeAreaProvider style={styles.fullscreen}>{playerSurface}</SafeAreaProvider>
      </Modal>
    </>
  );
};

export default memo(RutubeVideoPlayer);
