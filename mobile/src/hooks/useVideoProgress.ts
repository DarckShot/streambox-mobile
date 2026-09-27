import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { clearVideoProgress, loadVideoProgress, saveVideoProgress } from '../storage/videoProgress';
import { useWatchHistoryStore } from '../store/useWatchHistoryStore';
import { useSavedProgressStore } from '../store/useSavedProgressStore';
import { clampPlaybackTime } from '../utils/clampPlaybackTime';

const SAVE_INTERVAL_MS = 5000;
const SEEK_TOLERANCE_SECONDS = 3;
let hasReportedStorageError = false;

const reportStorageError = (error: unknown): void => {
  if (!hasReportedStorageError) {
    hasReportedStorageError = true;
    console.warn('Не удалось сохранить или загрузить позицию просмотра.', error);
  }
};

interface SavedProgress {
  loaded: boolean;
  position: number | null;
}

interface VideoProgressActions {
  beginReplay: () => void;
  complete: () => void;
  discard: () => void;
  flush: () => void;
  recordProgress: (time: number) => void;
  recordSeek: (time: number) => void;
  setDuration: (duration: number) => void;
}

interface UseVideoProgressResult {
  actions: VideoProgressActions;
  saved: SavedProgress;
}

export const useVideoProgress = (videoId: string, isActive: boolean): UseVideoProgressResult => {
  const [saved, setSaved] = useState<SavedProgress>({ loaded: false, position: null });
  const resetVersion = useSavedProgressStore((state) => state.resetVersion);
  const previousResetVersionRef = useRef(resetVersion);
  const loadedRef = useRef(false);
  const completedRef = useRef(false);
  const durationRef = useRef(0);
  const latestTimeRef = useRef<number | null>(null);
  const hasProgressThisSessionRef = useRef(false);
  const pendingSeekRef = useRef<number | null>(null);
  const lastWriteAtRef = useRef(0);

  useEffect(() => {
    if (previousResetVersionRef.current === resetVersion) return;
    previousResetVersionRef.current = resetVersion;
    latestTimeRef.current = null;
    hasProgressThisSessionRef.current = false;
    pendingSeekRef.current = null;
    setSaved({ loaded: true, position: null });
  }, [resetVersion]);

  const persist = useCallback(
    (time: number): void => {
      lastWriteAtRef.current = Date.now();
      saveVideoProgress(videoId, time).catch(reportStorageError);
      useSavedProgressStore.getState().setPosition(videoId, time);
      useWatchHistoryStore.getState().recordWatch(videoId, time, durationRef.current);
    },
    [videoId],
  );

  const flush = useCallback((): void => {
    const time = latestTimeRef.current;

    if (
      loadedRef.current &&
      !completedRef.current &&
      hasProgressThisSessionRef.current &&
      time !== null
    ) {
      persist(time);
    }
  }, [persist]);

  useEffect(() => {
    let mounted = true;

    loadVideoProgress(videoId)
      .catch((error: unknown) => {
        reportStorageError(error);
        return null;
      })
      .then((position) => {
        if (mounted) {
          latestTimeRef.current = position;
          loadedRef.current = true;
          setSaved({ loaded: true, position });
          if (position !== null) useSavedProgressStore.getState().setPosition(videoId, position);
        }
      });

    return () => {
      mounted = false;
      flush();
    };
  }, [flush, videoId]);

  useEffect(() => {
    if (!isActive) {
      flush();
    }
  }, [flush, isActive]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') {
        flush();
      }
    });

    return () => subscription.remove();
  }, [flush]);

  const setDuration = useCallback((duration: number): void => {
    durationRef.current = Number.isFinite(duration) && duration > 0 ? duration : 0;
  }, []);

  const recordProgress = useCallback(
    (time: number): void => {
      const duration = durationRef.current;

      if (!loadedRef.current || completedRef.current || !Number.isFinite(time) || time < 0) {
        return;
      }

      const nextTime = clampPlaybackTime(time, duration);
      const pendingSeek = pendingSeekRef.current;

      if (pendingSeek !== null) {
        if (Math.abs(nextTime - pendingSeek) > SEEK_TOLERANCE_SECONDS) {
          return;
        }
        pendingSeekRef.current = null;
      } else if (latestTimeRef.current !== null && nextTime < latestTimeRef.current - 2) {
        return;
      }

      latestTimeRef.current = nextTime;
      if (nextTime > 0) {
        hasProgressThisSessionRef.current = true;
      }

      if (nextTime > 0 && Date.now() - lastWriteAtRef.current >= SAVE_INTERVAL_MS) {
        persist(nextTime);
      }
    },
    [persist],
  );

  const recordSeek = useCallback(
    (time: number): void => {
      const duration = durationRef.current;

      if (!loadedRef.current || completedRef.current || !Number.isFinite(time) || time < 0) {
        return;
      }

      const nextTime = clampPlaybackTime(time, duration);
      latestTimeRef.current = nextTime;
      hasProgressThisSessionRef.current = true;
      pendingSeekRef.current = nextTime;
      persist(nextTime);
    },
    [persist],
  );

  const clear = useCallback((): void => {
    latestTimeRef.current = null;
    pendingSeekRef.current = null;
    setSaved({ loaded: true, position: null });
    clearVideoProgress(videoId).catch(reportStorageError);
    useSavedProgressStore.getState().setPosition(videoId, null);
  }, [videoId]);

  const complete = useCallback((): void => {
    completedRef.current = true;
    useWatchHistoryStore.getState().recordWatch(videoId, 0, durationRef.current);
    clear();
  }, [clear, videoId]);

  const beginReplay = useCallback((): void => {
    completedRef.current = false;
    hasProgressThisSessionRef.current = false;
    lastWriteAtRef.current = 0;
    clear();
    pendingSeekRef.current = 0;
  }, [clear]);

  const actions = useMemo<VideoProgressActions>(
    () => ({
      beginReplay,
      complete,
      discard: clear,
      flush,
      recordProgress,
      recordSeek,
      setDuration,
    }),
    [beginReplay, clear, complete, flush, recordProgress, recordSeek, setDuration],
  );

  return {
    actions,
    saved,
  };
};
