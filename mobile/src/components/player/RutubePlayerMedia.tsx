import { memo, type ReactElement } from 'react';
import { Pressable, View } from 'react-native';
import Video, { ResizeMode } from 'react-native-video';

import type { RutubeVideoPlayback } from '../../hooks/useRutubeVideoPlayback';
import { rutubeVideoPlayerStyles as styles } from './RutubeVideoPlayer.styles';
import VideoControls from './VideoControls';

interface RutubePlayerMediaProps {
  playback: RutubeVideoPlayback;
  posterUrl: string;
}

const RutubePlayerMedia = ({ playback, posterUrl }: RutubePlayerMediaProps): ReactElement => {
  const { canShowControls, controls, fullscreen, handlers, player, source, videoEvents, videoRef } =
    playback;
  const resizeMode = fullscreen.state.mounted ? ResizeMode.CONTAIN : ResizeMode.COVER;

  return (
    <View style={styles.media}>
      <Video
        ref={videoRef}
        key={player.mediaKey}
        muted={player.isMuted}
        onBuffer={videoEvents.onBuffer}
        onEnd={handlers.onEnd}
        onError={videoEvents.onError}
        onLoad={handlers.onLoad}
        onProgress={handlers.onProgress}
        paused={player.isPaused}
        poster={{ source: { uri: posterUrl }, resizeMode }}
        resizeMode={resizeMode}
        source={source}
        style={styles.video}
      />

      {canShowControls ? (
        <Pressable
          accessibilityLabel={controls.state.visible ? 'Скрыть управление' : 'Показать управление'}
          accessibilityRole="button"
          onPress={controls.actions.toggle}
          style={styles.controlsSurface}
        />
      ) : null}

      {controls.state.visible && canShowControls ? (
        <VideoControls
          currentTime={player.currentTime}
          duration={player.duration}
          fullscreen={fullscreen.state.mounted}
          isMuted={player.isMuted}
          isPaused={player.isPaused}
          onFullscreenPress={fullscreen.actions.toggle}
          onInteraction={controls.actions.show}
          onMutePress={handlers.onMutePress}
          onPlaybackPress={handlers.onPlaybackPress}
          onSeek={handlers.onSeek}
          onSeekStart={controls.actions.keepVisible}
        />
      ) : null}
    </View>
  );
};

export default memo(RutubePlayerMedia);
