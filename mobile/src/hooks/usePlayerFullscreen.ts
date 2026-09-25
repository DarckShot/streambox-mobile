import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, useWindowDimensions } from 'react-native';

interface PlayerFullscreenState {
  mounted: boolean;
  visible: boolean;
}

interface PlayerFullscreenActions {
  consumeRestorePosition: () => number | null;
  handleDismiss: () => void;
  toggle: () => void;
}

interface UsePlayerFullscreenResult {
  actions: PlayerFullscreenActions;
  state: PlayerFullscreenState;
}

export const usePlayerFullscreen = (
  currentTime: number,
  enabled: boolean,
): UsePlayerFullscreenResult => {
  const { height, width } = useWindowDimensions();
  const isLandscape = width > height;
  const currentTimeRef = useRef(currentTime);
  const restorePositionRef = useRef(0);
  const shouldRestorePositionRef = useRef(false);
  const landscapeDismissedRef = useRef(false);
  const [fullscreenVisible, setFullscreenVisible] = useState(false);
  const [fullscreenMounted, setFullscreenMounted] = useState(false);

  currentTimeRef.current = currentTime;

  const prepareTransition = useCallback((): void => {
    restorePositionRef.current = currentTimeRef.current;
    shouldRestorePositionRef.current = true;
  }, []);

  const openFullscreen = useCallback((): void => {
    prepareTransition();
    setFullscreenMounted(true);
    setFullscreenVisible(true);
  }, [prepareTransition]);

  const closeFullscreen = useCallback(
    (manual: boolean): void => {
      prepareTransition();

      if (manual && isLandscape) {
        landscapeDismissedRef.current = true;
      }

      setFullscreenVisible(false);

      if (Platform.OS !== 'ios') {
        setFullscreenMounted(false);
      }
    },
    [isLandscape, prepareTransition],
  );

  const toggleFullscreen = useCallback((): void => {
    if (fullscreenMounted) {
      closeFullscreen(true);
    } else {
      openFullscreen();
    }
  }, [closeFullscreen, fullscreenMounted, openFullscreen]);

  const handleFullscreenDismiss = useCallback((): void => {
    setFullscreenMounted(false);
  }, []);

  const consumeRestorePosition = useCallback((): number | null => {
    if (!shouldRestorePositionRef.current) {
      return null;
    }

    shouldRestorePositionRef.current = false;
    return restorePositionRef.current;
  }, []);

  useEffect(() => {
    if (!isLandscape) {
      landscapeDismissedRef.current = false;
      return;
    }

    if (enabled && !fullscreenMounted && !landscapeDismissedRef.current) {
      openFullscreen();
    }
  }, [enabled, fullscreenMounted, isLandscape, openFullscreen]);

  useEffect(() => {
    if (!enabled && fullscreenVisible) {
      closeFullscreen(false);
    }
  }, [closeFullscreen, enabled, fullscreenVisible]);

  const actions = useMemo<PlayerFullscreenActions>(
    () => ({
      consumeRestorePosition,
      handleDismiss: handleFullscreenDismiss,
      toggle: toggleFullscreen,
    }),
    [consumeRestorePosition, handleFullscreenDismiss, toggleFullscreen],
  );

  return {
    actions,
    state: {
      mounted: fullscreenMounted,
      visible: fullscreenVisible,
    },
  };
};
