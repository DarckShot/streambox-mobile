import { memo, useMemo, useRef, useState, type ReactElement } from 'react';
import type { GestureResponderEvent, LayoutChangeEvent } from 'react-native';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { STREAMBOX_COLORS } from '../../constants/theme';
import { formatPlaybackTime } from '../../utils/formatPlaybackTime';
import { FullscreenIcon } from '../icons/FullscreenIcon';
import { PauseIcon } from '../icons/PauseIcon';
import { PlayIcon } from '../icons/PlayIcon';
import { VolumeIcon } from '../icons/VolumeIcon';
import { videoControlsStyles as styles } from './VideoControls.styles';

const shouldHandleTimelineGesture = (): boolean => true;
const preventTimelineGestureTermination = (): boolean => false;

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
  const timelineRef = useRef<View>(null);
  const timelinePageXRef = useRef(0);
  const [timelineWidth, setTimelineWidth] = useState(0);
  const [dragTime, setDragTime] = useState<number | null>(null);
  const displayedTime = dragTime ?? currentTime;
  const progress = duration > 0 ? Math.min(displayedTime / duration, 1) : 0;
  const progressWidth: `${number}%` = `${progress * 100}%`;
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

  const handleTimelineLayout = (event: LayoutChangeEvent): void => {
    setTimelineWidth(event.nativeEvent.layout.width);
    timelineRef.current?.measureInWindow((pageX, _pageY, measuredWidth) => {
      timelinePageXRef.current = pageX;
      setTimelineWidth(measuredWidth);
    });
  };

  const getTimelineTime = (event: GestureResponderEvent): number | null => {
    if (timelineWidth <= 0 || duration <= 0) {
      return null;
    }

    const localPosition = event.nativeEvent.pageX - timelinePageXRef.current;
    const pressPosition = Math.min(Math.max(localPosition, 0), timelineWidth);
    return (pressPosition / timelineWidth) * duration;
  };

  const handleTimelineGestureStart = (event: GestureResponderEvent): void => {
    const nextTime = getTimelineTime(event);

    if (nextTime !== null) {
      setDragTime(nextTime);
    }

    onSeekStart();
  };

  const handleTimelineGestureMove = (event: GestureResponderEvent): void => {
    const nextTime = getTimelineTime(event);

    if (nextTime !== null) {
      setDragTime(nextTime);
    }
  };

  const handleTimelineGestureEnd = (event: GestureResponderEvent): void => {
    const nextTime = getTimelineTime(event) ?? dragTime;
    setDragTime(null);

    if (nextTime !== null) {
      onSeek(nextTime);
    }

    onInteraction();
  };

  const handleTimelineGestureCancel = (): void => {
    setDragTime(null);
    onInteraction();
  };

  const handlePlaybackPress = (): void => {
    onPlaybackPress();
    onInteraction();
  };

  const handleMutePress = (): void => {
    onMutePress();
    onInteraction();
  };

  const handleFullscreenPress = (): void => {
    onFullscreenPress();
    onInteraction();
  };

  return (
    <View
      style={[
        styles.container,
        fullscreen ? styles.containerFullscreen : null,
        fullscreenSafeAreaStyle,
      ]}
    >
      <View
        ref={timelineRef}
        accessibilityLabel="Перемотать видео"
        accessibilityRole="adjustable"
        accessibilityValue={{
          max: Math.round(duration),
          min: 0,
          now: Math.round(displayedTime),
        }}
        onLayout={handleTimelineLayout}
        onMoveShouldSetResponder={shouldHandleTimelineGesture}
        onResponderGrant={handleTimelineGestureStart}
        onResponderMove={handleTimelineGestureMove}
        onResponderRelease={handleTimelineGestureEnd}
        onResponderTerminate={handleTimelineGestureCancel}
        onResponderTerminationRequest={preventTimelineGestureTermination}
        onStartShouldSetResponder={shouldHandleTimelineGesture}
        style={styles.timeline}
      >
        <View style={styles.timelineTrack}>
          <View style={[styles.timelineProgress, { width: progressWidth }]}>
            {progress > 0 ? <View style={styles.timelineThumb} /> : null}
          </View>
        </View>
      </View>

      <View style={styles.controlsRow}>
        <Pressable
          accessibilityLabel={isPaused ? 'Продолжить' : 'Пауза'}
          accessibilityRole="button"
          hitSlop={8}
          onPress={handlePlaybackPress}
          style={({ pressed }) => [styles.iconButton, pressed ? styles.iconButtonPressed : null]}
        >
          {isPaused ? (
            <PlayIcon color={STREAMBOX_COLORS.white} />
          ) : (
            <PauseIcon color={STREAMBOX_COLORS.white} />
          )}
        </Pressable>

        <Text style={styles.time}>
          {formatPlaybackTime(displayedTime)} / {formatPlaybackTime(duration)}
        </Text>

        <Pressable
          accessibilityLabel={isMuted ? 'Включить звук' : 'Выключить звук'}
          accessibilityRole="button"
          hitSlop={8}
          onPress={handleMutePress}
          style={({ pressed }) => [styles.iconButton, pressed ? styles.iconButtonPressed : null]}
        >
          <VolumeIcon color={STREAMBOX_COLORS.white} muted={isMuted} />
        </Pressable>

        <Pressable
          accessibilityLabel={
            fullscreen ? 'Выйти из полноэкранного режима' : 'Открыть на весь экран'
          }
          accessibilityRole="button"
          hitSlop={8}
          onPress={handleFullscreenPress}
          style={({ pressed }) => [styles.iconButton, pressed ? styles.iconButtonPressed : null]}
        >
          <FullscreenIcon color={STREAMBOX_COLORS.white} fullscreen={fullscreen} />
        </Pressable>
      </View>
    </View>
  );
};

export default memo(VideoControls);
