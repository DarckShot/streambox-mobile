import { useRef, useState, type RefObject } from 'react';
import type { GestureResponderEvent, LayoutChangeEvent, View } from 'react-native';

const shouldHandleTimelineGesture = (): boolean => true;
const preventTimelineGestureTermination = (): boolean => false;

interface UseVideoTimelineParams {
  currentTime: number;
  duration: number;
  onInteraction: () => void;
  onSeek: (time: number) => void;
  onSeekStart: () => void;
}

interface VideoTimelineState {
  displayedTime: number;
  progress: number;
  progressWidth: `${number}%`;
}

interface VideoTimelineBindings {
  ref: RefObject<View | null>;
  onLayout: (event: LayoutChangeEvent) => void;
  onMoveShouldSetResponder: () => boolean;
  onResponderGrant: (event: GestureResponderEvent) => void;
  onResponderMove: (event: GestureResponderEvent) => void;
  onResponderRelease: (event: GestureResponderEvent) => void;
  onResponderTerminate: () => void;
  onResponderTerminationRequest: () => boolean;
  onStartShouldSetResponder: () => boolean;
}

interface UseVideoTimelineResult {
  bindings: VideoTimelineBindings;
  state: VideoTimelineState;
}

export const useVideoTimeline = ({
  currentTime,
  duration,
  onInteraction,
  onSeek,
  onSeekStart,
}: UseVideoTimelineParams): UseVideoTimelineResult => {
  const timelineRef = useRef<View>(null);
  const timelinePageXRef = useRef(0);
  const [timelineWidth, setTimelineWidth] = useState(0);
  const [dragTime, setDragTime] = useState<number | null>(null);
  const displayedTime = dragTime ?? currentTime;
  const progress = duration > 0 ? Math.min(displayedTime / duration, 1) : 0;
  const progressWidth: `${number}%` = `${progress * 100}%`;

  const handleLayout = (event: LayoutChangeEvent): void => {
    setTimelineWidth(event.nativeEvent.layout.width);
    timelineRef.current?.measureInWindow((pageX, _pageY, measuredWidth) => {
      timelinePageXRef.current = pageX;
      setTimelineWidth(measuredWidth);
    });
  };

  const getTimeFromGesture = (event: GestureResponderEvent): number | null => {
    if (timelineWidth <= 0 || duration <= 0) {
      return null;
    }

    const localPosition = event.nativeEvent.pageX - timelinePageXRef.current;
    const position = Math.min(Math.max(localPosition, 0), timelineWidth);
    return (position / timelineWidth) * duration;
  };

  const handleGestureStart = (event: GestureResponderEvent): void => {
    const nextTime = getTimeFromGesture(event);

    if (nextTime !== null) {
      setDragTime(nextTime);
    }

    onSeekStart();
  };

  const handleGestureMove = (event: GestureResponderEvent): void => {
    const nextTime = getTimeFromGesture(event);

    if (nextTime !== null) {
      setDragTime(nextTime);
    }
  };

  const handleGestureEnd = (event: GestureResponderEvent): void => {
    const nextTime = getTimeFromGesture(event) ?? dragTime;
    setDragTime(null);

    if (nextTime !== null) {
      onSeek(nextTime);
    }

    onInteraction();
  };

  const handleGestureCancel = (): void => {
    setDragTime(null);
    onInteraction();
  };

  return {
    bindings: {
      ref: timelineRef,
      onLayout: handleLayout,
      onMoveShouldSetResponder: shouldHandleTimelineGesture,
      onResponderGrant: handleGestureStart,
      onResponderMove: handleGestureMove,
      onResponderRelease: handleGestureEnd,
      onResponderTerminate: handleGestureCancel,
      onResponderTerminationRequest: preventTimelineGestureTermination,
      onStartShouldSetResponder: shouldHandleTimelineGesture,
    },
    state: {
      displayedTime,
      progress,
      progressWidth,
    },
  };
};
