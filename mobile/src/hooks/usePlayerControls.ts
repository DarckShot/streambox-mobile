import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const CONTROLS_HIDE_DELAY = 3000;

interface PlayerControlsState {
  visible: boolean;
}

interface PlayerControlsActions {
  keepVisible: () => void;
  show: () => void;
  toggle: () => void;
}

interface UsePlayerControlsResult {
  actions: PlayerControlsActions;
  state: PlayerControlsState;
}

export const usePlayerControls = (
  hasStarted: boolean,
  isPaused: boolean,
): UsePlayerControlsResult => {
  const [controlsVisible, setControlsVisible] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHideTimer = useCallback((): void => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const hideControls = useCallback((): void => {
    clearHideTimer();
    setControlsVisible(false);
  }, [clearHideTimer]);

  const keepControlsVisible = useCallback((): void => {
    clearHideTimer();
    setControlsVisible(true);
  }, [clearHideTimer]);

  const showControls = useCallback((): void => {
    clearHideTimer();
    setControlsVisible(true);

    if (!isPaused) {
      hideTimerRef.current = setTimeout(() => {
        setControlsVisible(false);
      }, CONTROLS_HIDE_DELAY);
    }
  }, [clearHideTimer, isPaused]);

  const toggleControls = useCallback((): void => {
    if (controlsVisible) {
      hideControls();
    } else {
      showControls();
    }
  }, [controlsVisible, hideControls, showControls]);

  useEffect(() => {
    if (!hasStarted) {
      hideControls();
    } else {
      showControls();
    }

    return clearHideTimer;
  }, [clearHideTimer, hasStarted, hideControls, isPaused, showControls]);

  const actions = useMemo<PlayerControlsActions>(
    () => ({
      keepVisible: keepControlsVisible,
      show: showControls,
      toggle: toggleControls,
    }),
    [keepControlsVisible, showControls, toggleControls],
  );

  return {
    actions,
    state: {
      visible: controlsVisible,
    },
  };
};
