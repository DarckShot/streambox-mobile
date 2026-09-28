import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import { queryClient } from '../api/queryClient';
import {
  addFavorite,
  recordWatch,
  removeFavorite,
  saveProgress,
  type FavoriteRecord,
  type HistoryRecord,
  type ProgressRecord,
} from '../api/me';
import { toApiError } from '../api/client';
import { getAccessToken, getSessionGeneration } from '../auth/session';
import { userKeys } from '../api/userKeys';
import { isOnline } from './networkState';

export type OfflineAction =
  | { kind: 'favorite'; videoId: string; present: boolean; revision: number }
  | { kind: 'history'; videoId: string; watchedAt: string; completed: boolean; revision: number }
  | {
      kind: 'progress';
      videoId: string;
      position: number;
      duration: number;
      observedAt: string;
      revision: number;
    };
export type NewOfflineAction =
  | { kind: 'favorite'; videoId: string; present: boolean }
  | { kind: 'history'; videoId: string; watchedAt: string; completed: boolean }
  | { kind: 'progress'; videoId: string; position: number; duration: number; observedAt: string };

const storageKey = (userId: string): string =>
  `streambox.offline-queue.${encodeURIComponent(userId)}`;
const queueByUser = new Map<string, OfflineAction[]>();
const loading = new Map<string, Promise<OfflineAction[]>>();
let serial = Promise.resolve();
const activeSyncs = new Map<string, Promise<void>>();
const retryCounts = new Map<string, number>();
const retryTimers = new Map<string, ReturnType<typeof setTimeout>>();
const syncFailures = new Map<string, string>();
const failureListeners = new Set<() => void>();
const publishFailure = (userId: string, message: string | null): void => {
  if (message) syncFailures.set(userId, message);
  else syncFailures.delete(userId);
  failureListeners.forEach((listener) => listener());
};
export const useSyncFailure = (userId: string): string | null =>
  useSyncExternalStore(
    (listener) => {
      failureListeners.add(listener);
      return () => failureListeners.delete(listener);
    },
    () => syncFailures.get(userId) ?? null,
    () => null,
  );

const validAction = (value: unknown): value is OfflineAction => {
  if (
    typeof value !== 'object' ||
    value === null ||
    !('kind' in value) ||
    !('videoId' in value) ||
    !('revision' in value) ||
    typeof value.videoId !== 'string' ||
    typeof value.revision !== 'number'
  )
    return false;
  if (value.kind === 'favorite') return 'present' in value && typeof value.present === 'boolean';
  if (value.kind === 'history')
    return (
      'watchedAt' in value &&
      typeof value.watchedAt === 'string' &&
      'completed' in value &&
      typeof value.completed === 'boolean'
    );
  return (
    value.kind === 'progress' &&
    'position' in value &&
    typeof value.position === 'number' &&
    Number.isFinite(value.position) &&
    'duration' in value &&
    typeof value.duration === 'number' &&
    Number.isFinite(value.duration) &&
    'observedAt' in value &&
    typeof value.observedAt === 'string'
  );
};

export const loadOfflineQueue = (userId: string): Promise<OfflineAction[]> => {
  const existing = queueByUser.get(userId);
  if (existing) return Promise.resolve(existing);
  const pending = loading.get(userId);
  if (pending) return pending;
  const task = AsyncStorage.getItem(storageKey(userId))
    .then((raw) => {
      let value: unknown;
      try {
        value = raw ? JSON.parse(raw) : [];
      } catch {
        value = [];
      }
      const actions = Array.isArray(value) ? value.filter(validAction) : [];
      queueByUser.set(userId, actions);
      return actions;
    })
    .finally(() => loading.delete(userId));
  loading.set(userId, task);
  return task;
};

export const applyPendingActions = (userId: string): void => {
  if (queryClient.getQueryData<{ id: string }>(userKeys.me)?.id !== userId) return;
  for (const action of getPendingActions(userId)) {
    if (action.kind === 'favorite') {
      queryClient.setQueryData<FavoriteRecord[]>(userKeys.favorites(userId), (items = []) =>
        action.present
          ? items.some((item) => item.videoId === action.videoId)
            ? items
            : [
                { videoId: action.videoId, createdAt: new Date(action.revision).toISOString() },
                ...items,
              ]
          : items.filter((item) => item.videoId !== action.videoId),
      );
    } else if (action.kind === 'history') {
      queryClient.setQueryData<HistoryRecord[]>(userKeys.history(userId), (items = []) => [
        { videoId: action.videoId, lastWatchedAt: action.watchedAt, completed: action.completed },
        ...items.filter((item) => item.videoId !== action.videoId),
      ]);
    } else {
      const record: ProgressRecord | null =
        action.position > 0
          ? {
              videoId: action.videoId,
              positionSeconds: action.position,
              durationSeconds: action.duration,
              updatedAt: action.observedAt,
            }
          : null;
      queryClient.setQueryData(userKeys.videoProgress(userId, action.videoId), record);
      queryClient.setQueryData<ProgressRecord[]>(userKeys.progress(userId), (items = []) =>
        record
          ? [record, ...items.filter((item) => item.videoId !== action.videoId)]
          : items.filter((item) => item.videoId !== action.videoId),
      );
    }
  }
};

const saveQueue = async (userId: string): Promise<void> => {
  await AsyncStorage.setItem(storageKey(userId), JSON.stringify(queueByUser.get(userId) ?? []));
};

export const stageOfflineAction = async (
  userId: string,
  action: NewOfflineAction,
): Promise<void> => {
  serial = serial
    .catch(() => undefined)
    .then(async () => {
      const queue = await loadOfflineQueue(userId);
      const next: OfflineAction = {
        ...action,
        revision: Date.now() + Math.random(),
      } as OfflineAction;
      queueByUser.set(userId, [
        ...queue.filter((item) => item.kind !== next.kind || item.videoId !== next.videoId),
        next,
      ]);
      await saveQueue(userId);
      applyPendingActions(userId);
      retryCounts.set(userId, 0);
    });
  await serial;
};

export const discardOfflineActions = async (
  userId: string,
  kind: OfflineAction['kind'],
): Promise<void> => {
  await loadOfflineQueue(userId);
  queueByUser.set(
    userId,
    (queueByUser.get(userId) ?? []).filter((item) => item.kind !== kind),
  );
  await saveQueue(userId);
};

const send = async (action: OfflineAction): Promise<void> => {
  if (action.kind === 'favorite') {
    if (action.present) await addFavorite(action.videoId);
    else await removeFavorite(action.videoId);
  } else if (action.kind === 'history') {
    await recordWatch(action.videoId, action.watchedAt, action.completed);
  } else {
    await saveProgress(action.videoId, action.position, action.duration, action.observedAt);
  }
};

export const drainOfflineSync = (userId: string): Promise<void> => {
  const timer = retryTimers.get(userId);
  if (timer) clearTimeout(timer);
  retryTimers.delete(userId);
  return activeSyncs.get(userId) ?? Promise.resolve();
};

export const syncOfflineQueue = (userId: string): Promise<void> => {
  const active = activeSyncs.get(userId);
  if (active) return active;
  if (
    !isOnline() ||
    !getAccessToken() ||
    queryClient.getQueryData<{ id: string }>(userKeys.me)?.id !== userId
  )
    return Promise.resolve();
  const timer = retryTimers.get(userId);
  if (timer) clearTimeout(timer);
  retryTimers.delete(userId);
  const generation = getSessionGeneration();
  const task = (async (): Promise<void> => {
    await loadOfflineQueue(userId);
    for (let attempt = 0; attempt < 100; attempt += 1) {
      const action = (queueByUser.get(userId) ?? [])[0];
      if (!action) break;
      if (!isOnline() || !getAccessToken() || generation !== getSessionGeneration()) break;
      let rejected = false;
      try {
        await send(action);
      } catch (error) {
        const kind = toApiError(error).kind;
        if (
          kind === 'network' ||
          kind === 'timeout' ||
          kind === 'server' ||
          kind === 'unauthorized'
        ) {
          console.warn('Ошибка синхронизации пользовательских данных:', kind);
          if (isOnline() && kind !== 'unauthorized') {
            const count = (retryCounts.get(userId) ?? 0) + 1;
            retryCounts.set(userId, count);
            if (count <= 2)
              retryTimers.set(
                userId,
                setTimeout(() => {
                  retryTimers.delete(userId);
                  void syncOfflineQueue(userId);
                }, count * 5000),
              );
          }
          break;
        }
        console.warn('Отклонено изменение пользовательских данных:', kind);
        publishFailure(
          userId,
          'Не удалось сохранить изменение. Проверьте данные и повторите действие.',
        );
        rejected = true;
      }
      const current = queueByUser.get(userId) ?? [];
      queueByUser.set(
        userId,
        current.filter((item) =>
          item.kind === action.kind && item.videoId === action.videoId
            ? item.revision !== action.revision
            : true,
        ),
      );
      await saveQueue(userId);
      retryCounts.set(userId, 0);
      if (!rejected) publishFailure(userId, null);
      void queryClient.invalidateQueries({ queryKey: ['users', userId] });
    }
  })().finally(() => activeSyncs.delete(userId));
  activeSyncs.set(userId, task);
  return task;
};

export const getPendingActions = (userId: string): OfflineAction[] => queueByUser.get(userId) ?? [];

export const overlayPendingFavorites = (
  userId: string,
  records: FavoriteRecord[],
): FavoriteRecord[] => {
  let result = records;
  for (const action of getPendingActions(userId)) {
    if (action.kind !== 'favorite') continue;
    result = action.present
      ? result.some((item) => item.videoId === action.videoId)
        ? result
        : [
            { videoId: action.videoId, createdAt: new Date(action.revision).toISOString() },
            ...result,
          ]
      : result.filter((item) => item.videoId !== action.videoId);
  }
  return result;
};

export const overlayPendingHistory = (
  userId: string,
  records: HistoryRecord[],
): HistoryRecord[] => {
  let result = records;
  for (const action of getPendingActions(userId)) {
    if (action.kind !== 'history') continue;
    result = [
      { videoId: action.videoId, lastWatchedAt: action.watchedAt, completed: action.completed },
      ...result.filter((item) => item.videoId !== action.videoId),
    ];
  }
  return result;
};

export const overlayPendingProgress = (
  userId: string,
  records: ProgressRecord[],
): ProgressRecord[] => {
  let result = records;
  for (const action of getPendingActions(userId)) {
    if (action.kind !== 'progress') continue;
    result =
      action.position > 0
        ? [
            {
              videoId: action.videoId,
              positionSeconds: action.position,
              durationSeconds: action.duration,
              updatedAt: action.observedAt,
            },
            ...result.filter((item) => item.videoId !== action.videoId),
          ]
        : result.filter((item) => item.videoId !== action.videoId);
  }
  return result;
};
