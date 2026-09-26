import { memo, useMemo, type ReactElement } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PLAYER_SEEK_STEP_SECONDS } from '../../constants/player';
import { STREAMBOX_COLORS } from '../../constants/theme';
import { formatPlaybackTime } from '../../utils/formatPlaybackTime';
import { FullscreenIcon } from '../icons/FullscreenIcon';
import { PauseIcon } from '../icons/PauseIcon';
import { PlayIcon } from '../icons/PlayIcon';
import { SeekIcon } from '../icons/SeekIcon';
import { VolumeIcon } from '../icons/VolumeIcon';
import VideoControlButton from './VideoControlButton';
import { videoControlsStyles as styles } from './VideoControls.styles';
import { useVideoControlActions } from './useVideoControlActions';
import { useVideoTimeline } from './useVideoTimeline';

interface VideoControlsProps {
  currentTime: number;
  duration: number;
  fullscreen: boolean;
  isMuted: boolean;
  isPaused: boolean;
  onFullscreenPress: () => void;
  onMutePress: () => void;
  onPlaybackPress: () => void;
  onSeek: (time: number) => void;
  onSeekStart: () => void;
  onInteraction: () => void;
}

const VideoControls = ({
  currentTime,
  duration,
  fullscreen,
  isMuted,
  isPaused,
  onFullscreenPress,
  onMutePress,
  onPlaybackPress,
  onSeek,
  onSeekStart,
  onInteraction,
}: VideoControlsProps): ReactElement => {
  const safeAreaInsets = useSafeAreaInsets();
  const actions = useVideoControlActions({
    currentTime,
    onFullscreenPress,
    onInteraction,
    onMutePress,
    onPlaybackPress,
    onSeek,
  });
  const { bindings: timelineBindings, state: timeline } = useVideoTimeline({
    currentTime,
    duration,
    onInteraction,
    onSeek,
    onSeekStart,
  });
  const canSeekBackward = currentTime > 0;
  const canSeekForward = duration > 0 && currentTime < duration;
  const fullscreenSafeAreaStyle = useMemo(
    () =>
      fullscreen
        ? {
            paddingRight: safeAreaInsets.right + 24,
            paddingBottom: safeAreaInsets.bottom + 24,
            paddingLeft: safeAreaInsets.left + 24,
          }
        : null,
    [fullscreen, safeAreaInsets.bottom, safeAreaInsets.left, safeAreaInsets.right],
  );

  return (
    <View
      style={[
        styles.container,
        fullscreen ? styles.containerFullscreen : null,
        fullscreenSafeAreaStyle,
      ]}
    >
      <View
        {...timelineBindings}
        accessibilityLabel="Перемотать видео"
        accessibilityRole="adjustable"
        accessibilityValue={{
          max: Math.round(duration),
          min: 0,
          now: Math.round(timeline.displayedTime),
        }}
        style={styles.timeline}
      >
        <View style={styles.timelineTrack}>
          <View style={[styles.timelineProgress, { width: timeline.progressWidth }]}>
            {timeline.progress > 0 ? <View style={styles.timelineThumb} /> : null}
          </View>
        </View>
      </View>

      <View style={styles.controlsRow}>
        <VideoControlButton
          accessibilityLabel={`Назад на ${PLAYER_SEEK_STEP_SECONDS} секунд`}
          disabled={!canSeekBackward}
          onPress={actions.seekBackward}
        >
          <SeekIcon color={STREAMBOX_COLORS.white} direction="backward" />
        </VideoControlButton>

        <VideoControlButton
          accessibilityLabel={isPaused ? 'Продолжить' : 'Пауза'}
          onPress={actions.togglePlayback}
        >
          {isPaused ? (
            <PlayIcon color={STREAMBOX_COLORS.white} />
          ) : (
            <PauseIcon color={STREAMBOX_COLORS.white} />
          )}
        </VideoControlButton>

        <VideoControlButton
          accessibilityLabel={`Вперёд на ${PLAYER_SEEK_STEP_SECONDS} секунд`}
          disabled={!canSeekForward}
          onPress={actions.seekForward}
        >
          <SeekIcon color={STREAMBOX_COLORS.white} direction="forward" />
        </VideoControlButton>

        <Text style={styles.time}>
          {formatPlaybackTime(timeline.displayedTime)} / {formatPlaybackTime(duration)}
        </Text>

        <VideoControlButton
          accessibilityLabel={isMuted ? 'Включить звук' : 'Выключить звук'}
          onPress={actions.toggleMute}
        >
          <VolumeIcon color={STREAMBOX_COLORS.white} muted={isMuted} />
        </VideoControlButton>

        <VideoControlButton
          accessibilityLabel={
            fullscreen ? 'Выйти из полноэкранного режима' : 'Открыть на весь экран'
          }
          onPress={actions.toggleFullscreen}
        >
          <FullscreenIcon color={STREAMBOX_COLORS.white} fullscreen={fullscreen} />
        </VideoControlButton>
      </View>
    </View>
  );
};

export default memo(VideoControls);
