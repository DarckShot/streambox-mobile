import { memo, type ReactElement } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { Modal, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import type { RutubeVideoPlayback } from '../../hooks/useRutubeVideoPlayback';
import BasicVideoPlayer from './BasicVideoPlayer';
import RutubePlayerMedia from './RutubePlayerMedia';
import { rutubeVideoPlayerStyles as styles } from './RutubeVideoPlayer.styles';

interface RutubePlayerPresentationProps {
  containerStyle?: StyleProp<ViewStyle>;
  playback: RutubeVideoPlayback;
  posterUrl: string;
}

const RutubePlayerPresentation = ({
  containerStyle,
  playback,
  posterUrl,
}: RutubePlayerPresentationProps): ReactElement => {
  const { fullscreen, handlers, mediaReady, player, status } = playback;
  const media =
    player.playbackUrl && mediaReady ? (
      <RutubePlayerMedia playback={playback} posterUrl={posterUrl} />
    ) : null;
  const errorDescription = player.errorMessage ?? 'Не удалось получить ссылку на видеопоток.';
  const frameProps = {
    errorDescription,
    onErrorActionPress: handlers.onRetryPress,
    onPlaybackPress: handlers.onPlaybackPress,
    posterUrl,
    status,
  };

  return (
    <>
      <BasicVideoPlayer
        {...frameProps}
        containerStyle={containerStyle}
        media={fullscreen.state.mounted ? undefined : media}
      />

      <Modal
        animationType="none"
        onDismiss={fullscreen.actions.handleDismiss}
        onRequestClose={fullscreen.actions.close}
        navigationBarTranslucent
        presentationStyle="fullScreen"
        statusBarTranslucent
        supportedOrientations={['portrait', 'landscape-left', 'landscape-right']}
        visible={fullscreen.state.visible}
      >
        <StatusBar hidden />
        <SafeAreaProvider style={styles.fullscreen}>
          <BasicVideoPlayer {...frameProps} containerStyle={styles.fullscreenFrame} media={media} />
        </SafeAreaProvider>
      </Modal>
    </>
  );
};

export default memo(RutubePlayerPresentation);
