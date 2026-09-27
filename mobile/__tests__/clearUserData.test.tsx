import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ReactTestRenderer from 'react-test-renderer';

import { useClearUserData } from '../src/hooks/useUserData';
import { loadFavoriteIds, saveFavoriteIds } from '../src/storage/favorites';
import { loadWatchHistory, saveWatchHistory } from '../src/storage/watchHistory';
import { loadVideoProgress, saveVideoProgress } from '../src/storage/videoProgress';
import { clearFavorites, clearHistory, clearProgress } from '../src/api/me';

jest.mock('../src/api/me', () => ({
  clearFavorites: jest.fn(async () => undefined),
  clearHistory: jest.fn(async () => undefined),
  clearProgress: jest.fn(async () => undefined),
}));

it('сброс данных удаляет и локальные записи, чтобы они не вернулись после входа', async () => {
  await saveFavoriteIds(['video-001']);
  await saveWatchHistory([
    { videoId: 'video-001', lastWatchedAt: Date.now(), position: 10, duration: 60 },
  ]);
  await saveVideoProgress('video-001', 10);

  let clear!: ReturnType<typeof useClearUserData>;
  const Probe = (): null => {
    clear = useClearUserData('user-1');
    return null;
  };
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(
      <QueryClientProvider client={new QueryClient()}>
        <Probe />
      </QueryClientProvider>,
    );
  });
  await ReactTestRenderer.act(async () => {
    await Promise.all([
      clear.favorites.mutateAsync(),
      clear.history.mutateAsync(),
      clear.progress.mutateAsync(),
    ]);
  });

  expect(clearFavorites).toHaveBeenCalledTimes(1);
  expect(clearHistory).toHaveBeenCalledTimes(1);
  expect(clearProgress).toHaveBeenCalledTimes(1);
  expect(await loadFavoriteIds()).toEqual([]);
  expect(await loadWatchHistory()).toEqual([]);
  expect(await loadVideoProgress('video-001')).toBeNull();
  await ReactTestRenderer.act(() => renderer.unmount());
});
