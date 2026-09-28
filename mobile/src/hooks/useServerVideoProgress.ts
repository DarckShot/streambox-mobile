import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { userKeys, userQueries } from '../api/userQueries';
import { clampPlaybackTime } from '../utils/clampPlaybackTime';
import { useCurrentUser } from './useUserData';
import { getSessionGeneration } from '../auth/session';
import { clearVideoProgress } from '../storage/videoProgress';
import { enqueueUserWrite } from '../services/userWriteQueue';
import { stageOfflineAction, syncOfflineQueue, getPendingActions } from '../services/offlineQueue';

const SAVE_INTERVAL_MS = 5000;
const LOCAL_SAVE_INTERVAL_MS = 1000;
const SEEK_TOLERANCE_SECONDS = 3;
interface SavedProgress {
  loaded: boolean;
  position: number | null;
}
interface ProgressActions {
  beginReplay: () => void;
  complete: () => void;
  discard: () => void;
  flush: () => void;
  recordStart: () => void;
  recordProgress: (time: number) => void;
  recordSeek: (time: number) => void;
  setDuration: (duration: number) => void;
}

export const useServerVideoProgress = (
  videoId: string,
  isActive: boolean,
): { actions: ProgressActions; saved: SavedProgress } => {
  const user = useCurrentUser();
  const userId = user.data?.id ?? '';
  const queryClient = useQueryClient();
  const progress = useQuery({
    ...userQueries.videoProgress(userId, videoId),
    enabled: Boolean(userId),
  });
  const [saved, setSaved] = useState<SavedProgress>({ loaded: false, position: null });
  const loadedRef = useRef(false);
  const completedRef = useRef(false);
  const durationRef = useRef(0);
  const latestTimeRef = useRef<number | null>(null);
  const pendingSeekRef = useRef<number | null>(null);
  const lastWriteAtRef = useRef(0);
  const lastLocalWriteAtRef = useRef(0);
  const hasProgressRef = useRef(false);
  const watchedRef = useRef(false);
  const sessionGenerationRef = useRef(getSessionGeneration());

  useEffect(() => {
    if (user.isError && !loadedRef.current) {
      loadedRef.current = true;
      setSaved({ loaded: true, position: null });
      return;
    }
    if (!userId || progress.isPending || loadedRef.current) return;
    const queued = getPendingActions(userId).find(
      (action) => action.kind === 'progress' && action.videoId === videoId,
    );
    const position = queued?.kind === 'progress' ? queued.position : progress.data?.positionSeconds;
    const valid = typeof position === 'number' && Number.isFinite(position) && position > 0;
    latestTimeRef.current = valid ? position : null;
    loadedRef.current = true;
    setSaved({ loaded: true, position: valid ? position : null });
  }, [user.isError, userId, videoId, progress.isPending, progress.data]);

  const updateCache = useCallback((): void => {
    queryClient.invalidateQueries({ queryKey: userKeys.progress(userId) });
    queryClient.invalidateQueries({ queryKey: userKeys.videoProgress(userId, videoId) });
  }, [queryClient, userId, videoId]);

  const persist = useCallback(
    (time: number): void => {
      if (!userId) return;
      lastWriteAtRef.current = Date.now();
      lastLocalWriteAtRef.current = Date.now();
      enqueueUserWrite(`${userId}:${videoId}`, async () => {
        if (sessionGenerationRef.current !== getSessionGeneration()) return;
        await stageOfflineAction(userId, {
          kind: 'progress',
          videoId,
          position: time,
          duration: durationRef.current,
          observedAt: new Date().toISOString(),
        });
        void syncOfflineQueue(userId);
        updateCache();
      });
    },
    [updateCache, userId, videoId],
  );

  const saveLocally = useCallback(
    (time: number): void => {
      if (!userId) return;
      lastLocalWriteAtRef.current = Date.now();
      enqueueUserWrite(`${userId}:${videoId}`, async () => {
        if (sessionGenerationRef.current !== getSessionGeneration()) return;
        await stageOfflineAction(userId, {
          kind: 'progress',
          videoId,
          position: time,
          duration: durationRef.current,
          observedAt: new Date().toISOString(),
        });
      });
    },
    [userId, videoId],
  );

  const flush = useCallback((): void => {
    const time = latestTimeRef.current;
    if (loadedRef.current && !completedRef.current && hasProgressRef.current && time !== null)
      persist(time);
  }, [persist]);

  useEffect(() => () => flush(), [flush]);
  useEffect(() => {
    if (!isActive) flush();
  }, [flush, isActive]);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') flush();
    });
    return () => subscription.remove();
  }, [flush]);

  const clear = useCallback((): void => {
    latestTimeRef.current = null;
    pendingSeekRef.current = null;
    setSaved({ loaded: true, position: null });
    enqueueUserWrite(`${userId}:${videoId}`, async () => {
      if (sessionGenerationRef.current !== getSessionGeneration()) return;
      await clearVideoProgress(videoId);
      await stageOfflineAction(userId, {
        kind: 'progress',
        videoId,
        position: 0,
        duration: durationRef.current,
        observedAt: new Date().toISOString(),
      });
      void syncOfflineQueue(userId);
      updateCache();
    });
  }, [updateCache, userId, videoId]);

  const recordStart = useCallback((): void => {
    if (!userId || watchedRef.current || completedRef.current) return;
    watchedRef.current = true;
    enqueueUserWrite(`${userId}:${videoId}:history`, async () => {
      if (sessionGenerationRef.current !== getSessionGeneration()) return;
      try {
        await stageOfflineAction(userId, {
          kind: 'history',
          videoId,
          watchedAt: new Date().toISOString(),
          completed: false,
        });
        void syncOfflineQueue(userId);
        void queryClient.invalidateQueries({ queryKey: userKeys.history(userId) });
      } catch {
        if (!completedRef.current) watchedRef.current = false;
      }
    });
  }, [queryClient, userId, videoId]);

  const recordProgress = useCallback(
    (time: number): void => {
      if (!loadedRef.current || completedRef.current || !Number.isFinite(time) || time < 0) return;
      const nextTime = clampPlaybackTime(time, durationRef.current);
      const pendingSeek = pendingSeekRef.current;
      if (pendingSeek !== null) {
        if (Math.abs(nextTime - pendingSeek) > SEEK_TOLERANCE_SECONDS) return;
        pendingSeekRef.current = null;
      } else if (latestTimeRef.current !== null && nextTime < latestTimeRef.current - 2) return;
      latestTimeRef.current = nextTime;
      if (nextTime > 0) {
        hasProgressRef.current = true;
        recordStart();
        if (Date.now() - lastWriteAtRef.current >= SAVE_INTERVAL_MS) persist(nextTime);
        else if (Date.now() - lastLocalWriteAtRef.current >= LOCAL_SAVE_INTERVAL_MS)
          saveLocally(nextTime);
      }
    },
    [persist, recordStart, saveLocally],
  );

  const recordSeek = useCallback(
    (time: number): void => {
      if (!loadedRef.current || completedRef.current || !Number.isFinite(time) || time < 0) return;
      const nextTime = clampPlaybackTime(time, durationRef.current);
      latestTimeRef.current = nextTime;
      hasProgressRef.current = true;
      pendingSeekRef.current = nextTime;
      persist(nextTime);
    },
    [persist],
  );

  const complete = useCallback((): void => {
    completedRef.current = true;
    enqueueUserWrite(`${userId}:${videoId}:history`, async () => {
      if (sessionGenerationRef.current !== getSessionGeneration()) return;
      await stageOfflineAction(userId, {
        kind: 'history',
        videoId,
        watchedAt: new Date().toISOString(),
        completed: true,
      });
      void syncOfflineQueue(userId);
    });
    clear();
  }, [clear, userId, videoId]);
  const beginReplay = useCallback((): void => {
    completedRef.current = false;
    hasProgressRef.current = false;
    watchedRef.current = false;
    lastWriteAtRef.current = 0;
    clear();
    recordStart();
    pendingSeekRef.current = 0;
  }, [clear, recordStart]);
  const setDuration = useCallback((duration: number): void => {
    durationRef.current = Number.isFinite(duration) && duration > 0 ? duration : 0;
  }, []);

  const actions = useMemo<ProgressActions>(
    () => ({
      beginReplay,
      complete,
      discard: clear,
      flush,
      recordStart,
      recordProgress,
      recordSeek,
      setDuration,
    }),
    [beginReplay, clear, complete, flush, recordStart, recordProgress, recordSeek, setDuration],
  );
  return { actions, saved };
};
