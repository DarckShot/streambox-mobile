import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, useWindowDimensions } from 'react-native';

interface PlayerFullscreenState {
  inlineStartPosition: number;
  modalStartPosition: number;
  mounted: boolean;
  visible: boolean;
}

interface PlayerFullscreenActions {
  close: () => void;
  consumeRestorePosition: () => number | null;
  handleDismiss: () => void;
  resetStartPosition: () => void;
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
  const [inlineStartPosition, setInlineStartPosition] = useState(0);
  const [modalStartPosition, setModalStartPosition] = useState(0);

  currentTimeRef.current = currentTime;

  const prepareTransition = useCallback((): void => {
    restorePositionRef.current = currentTimeRef.current;
    shouldRestorePositionRef.current = true;
  }, []);

  const openFullscreen = useCallback((): void => {
    prepareTransition();
    setModalStartPosition(Math.round(restorePositionRef.current * 1000));
    setFullscreenMounted(true);
    setFullscreenVisible(true);
  }, [prepareTransition]);

  const closeFullscreen = useCallback(
    (manual: boolean): void => {
      if (!fullscreenVisible) {
        return;
      }

      prepareTransition();
      setInlineStartPosition(Math.round(restorePositionRef.current * 1000));

      if (manual && isLandscape) {
        landscapeDismissedRef.current = true;
      }

      setFullscreenVisible(false);

      if (Platform.OS !== 'ios') {
        setFullscreenMounted(false);
      }
    },
    [fullscreenVisible, isLandscape, prepareTransition],
  );

  const toggleFullscreen = useCallback((): void => {
    if (fullscreenVisible) {
      closeFullscreen(true);
    } else if (!fullscreenMounted) {
      openFullscreen();
    }
  }, [closeFullscreen, fullscreenMounted, fullscreenVisible, openFullscreen]);

  const exitFullscreen = useCallback((): void => {
    closeFullscreen(true);
  }, [closeFullscreen]);

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

  const resetStartPosition = useCallback((): void => {
    restorePositionRef.current = 0;
    shouldRestorePositionRef.current = false;
    setInlineStartPosition(0);
    setModalStartPosition(0);
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
      close: exitFullscreen,
      consumeRestorePosition,
      handleDismiss: handleFullscreenDismiss,
      resetStartPosition,
      toggle: toggleFullscreen,
    }),
    [
      consumeRestorePosition,
      exitFullscreen,
      handleFullscreenDismiss,
      resetStartPosition,
      toggleFullscreen,
    ],
  );

  return {
    actions,
    state: {
      inlineStartPosition,
      modalStartPosition,
      mounted: fullscreenMounted,
      visible: fullscreenVisible,
    },
  };
};
