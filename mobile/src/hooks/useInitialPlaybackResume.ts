import { useCallback, useEffect, useRef, useState } from 'react';

interface SavedPosition {
  loaded: boolean;
  position: number | null;
}

interface InitialPlaybackResumeOptions {
  isFocused: boolean;
  onDiscard: () => void;
  onRestore: (position: number) => void;
  saved: SavedPosition;
}

interface InitialPlaybackResume {
  ready: boolean;
  recordMediaLoad: (duration: number) => void;
}

export const useInitialPlaybackResume = ({
  isFocused,
  onDiscard,
  onRestore,
  saved,
}: InitialPlaybackResumeOptions): InitialPlaybackResume => {
  const restoredRef = useRef(false);
  const [firstDuration, setFirstDuration] = useState<number | null>(null);
  const [ready, setReady] = useState(false);

  const recordMediaLoad = useCallback((duration: number): void => {
    if (!restoredRef.current) {
      setFirstDuration(duration);
    }
  }, []);

  useEffect(() => {
    if (restoredRef.current || !saved.loaded || firstDuration === null || !isFocused) {
      return;
    }

    restoredRef.current = true;
    const position = saved.position;

    if (position !== null) {
      if (!Number.isFinite(firstDuration) || firstDuration <= 0 || position < firstDuration - 1) {
        onRestore(position);
      } else {
        onDiscard();
      }
    }

    setReady(true);
  }, [firstDuration, isFocused, onDiscard, onRestore, saved.loaded, saved.position]);

  return { ready, recordMediaLoad };
};
