import AsyncStorage from '@react-native-async-storage/async-storage';

import { getPendingActions, stageOfflineAction } from '../src/services/offlineQueue';
import { syncOfflineQueue } from '../src/services/offlineQueue';
import * as meApi from '../src/api/me';
import { clearSession, saveSession } from '../src/auth/session';
import { ApiError } from '../src/api/client';
import { queryClient } from '../src/api/queryClient';
import { userKeys } from '../src/api/userKeys';

it('сохраняет последнее действие для видео отдельно по пользователям', async () => {
  const first = 'offline-test-user-a';
  const second = 'offline-test-user-b';
  await stageOfflineAction(first, { kind: 'favorite', videoId: 'video-1', present: true });
  await stageOfflineAction(first, { kind: 'favorite', videoId: 'video-1', present: false });
  await stageOfflineAction(second, { kind: 'favorite', videoId: 'video-1', present: true });

  expect(getPendingActions(first)).toEqual([
    expect.objectContaining({ kind: 'favorite', videoId: 'video-1', present: false }),
  ]);
  expect(getPendingActions(second)).toEqual([
    expect.objectContaining({ kind: 'favorite', videoId: 'video-1', present: true }),
  ]);
  expect(await AsyncStorage.getItem('streambox.offline-queue.offline-test-user-a')).toContain(
    '"present":false',
  );
});

it('завершение видео заменяет ожидающую отправки позицию', async () => {
  const userId = 'offline-test-progress';
  await stageOfflineAction(userId, {
    kind: 'progress',
    videoId: 'video-2',
    position: 85,
    duration: 100,
    observedAt: '2026-01-01T00:00:00.000Z',
  });
  await stageOfflineAction(userId, {
    kind: 'progress',
    videoId: 'video-2',
    position: 0,
    duration: 100,
    observedAt: '2026-01-01T00:01:00.000Z',
  });
  expect(getPendingActions(userId)).toEqual([
    expect.objectContaining({ kind: 'progress', videoId: 'video-2', position: 0 }),
  ]);
});

it('после сетевой ошибки повторяет idempotent действие и удаляет его из очереди', async () => {
  const userId = 'offline-test-replay';
  const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  const send = jest
    .spyOn(meApi, 'addFavorite')
    .mockRejectedValueOnce(new ApiError('network', 'Нет сети.'))
    .mockResolvedValue({ videoId: 'video-3', createdAt: 'now' });
  await saveSession({ accessToken: 'test-access', refreshToken: 'test-refresh' });
  queryClient.setQueryData(userKeys.me, { id: userId });
  await stageOfflineAction(userId, { kind: 'favorite', videoId: 'video-3', present: true });
  await syncOfflineQueue(userId);
  expect(getPendingActions(userId)).toHaveLength(1);
  await syncOfflineQueue(userId);
  expect(getPendingActions(userId)).toHaveLength(0);
  await syncOfflineQueue(userId);
  expect(send).toHaveBeenCalledTimes(2);
  send.mockRestore();
  warn.mockRestore();
  await clearSession();
  queryClient.clear();
});

it('не отправляет очередь предыдущего аккаунта после смены пользователя', async () => {
  const previousUser = 'offline-test-previous';
  const send = jest.spyOn(meApi, 'addFavorite').mockResolvedValue({
    videoId: 'video-4',
    createdAt: 'now',
  });
  await saveSession({ accessToken: 'second-access', refreshToken: 'second-refresh' });
  queryClient.setQueryData(userKeys.me, { id: 'offline-test-current' });
  await stageOfflineAction(previousUser, { kind: 'favorite', videoId: 'video-4', present: true });
  await syncOfflineQueue(previousUser);
  expect(send).not.toHaveBeenCalled();
  expect(getPendingActions(previousUser)).toHaveLength(1);
  send.mockRestore();
  await clearSession();
  queryClient.clear();
});
