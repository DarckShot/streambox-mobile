import { useCallback, useEffect, useMemo, useState } from 'react';

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

export const usePlayerControls = (hasStarted: boolean): UsePlayerControlsResult => {
  const [controlsVisible, setControlsVisible] = useState(false);

  const showControls = useCallback((): void => {
    setControlsVisible(true);
  }, []);

  const toggleControls = useCallback((): void => {
    setControlsVisible((visible) => !visible);
  }, []);

  useEffect(() => {
    setControlsVisible(hasStarted);
  }, [hasStarted]);

  const actions = useMemo<PlayerControlsActions>(
    () => ({
      keepVisible: showControls,
      show: showControls,
      toggle: toggleControls,
    }),
    [showControls, toggleControls],
  );

  return {
    actions,
    state: {
      visible: controlsVisible,
    },
  };
};
