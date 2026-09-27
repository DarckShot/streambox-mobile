import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ReactTestRenderer from 'react-test-renderer';

import { videoKeys } from '../src/api/videoQueries';
import { userKeys } from '../src/api/userQueries';
import { addFavorite, removeFavorite } from '../src/api/me';
import { sampleVideo } from '../testFixtures/video';
import { RootRoute } from '../src/navigation/routes';
import { VideoDetailsScreen } from '../src/screens/VideoDetailsScreen';
import { loadFavoriteIds, saveFavoriteIds } from '../src/storage/favorites';

const mockFavoriteIds: string[] = [];
jest.mock('../src/api/me', () => ({
  addFavorite: jest.fn(async (videoId: string) => {
    mockFavoriteIds.push(videoId);
    return { videoId, createdAt: new Date().toISOString() };
  }),
  removeFavorite: jest.fn(async (videoId: string) => {
    mockFavoriteIds.splice(mockFavoriteIds.indexOf(videoId), 1);
  }),
  getFavorites: jest.fn(async () =>
    mockFavoriteIds.map((videoId) => ({ videoId, createdAt: new Date().toISOString() })),
  ),
  getCurrentUser: jest.fn(async () => ({ id: 'user-1', email: 'test@example.com' })),
  getHistory: jest.fn(async () => []),
  getProgress: jest.fn(async () => []),
}));

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({ colors: { background: '#FFFFFF', text: '#111111' }, dark: false }),
}));

jest.mock('../src/components/player/RutubeVideoPlayer', () => 'MockVideoPlayer');

beforeEach(async () => {
  jest.clearAllMocks();
  mockFavoriteIds.length = 0;
  await saveFavoriteIds([]);
});

it('кнопка VideoDetails добавляет и удаляет видео, обновляя своё состояние', async () => {
  const props = {
    navigation: { goBack: jest.fn() },
    route: { key: 'details', name: RootRoute.VideoDetails, params: { videoId: 'video-001' } },
  } as unknown as Parameters<typeof VideoDetailsScreen>[0];
  let renderer!: ReactTestRenderer.ReactTestRenderer;

  const queryClient = new QueryClient({ defaultOptions: { queries: { gcTime: 0 } } });
  queryClient.setQueryData(videoKeys.detail('video-001'), sampleVideo);
  queryClient.setQueryData(userKeys.me, { id: 'user-1', email: 'test@example.com' });
  queryClient.setQueryData(userKeys.favorites('user-1'), []);
  queryClient.setQueryData(userKeys.history('user-1'), []);
  queryClient.setQueryData(userKeys.progress('user-1'), []);
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(
      <QueryClientProvider client={queryClient}>
        <VideoDetailsScreen {...props} />
      </QueryClientProvider>,
    );
  });

  const pressFavorite = (label: string): void => {
    renderer.root
      .findAllByProps({ accessibilityLabel: label })
      .find((node) => typeof node.props.onPress === 'function')!
      .props.onPress();
  };

  await ReactTestRenderer.act(async () => {
    pressFavorite('В избранное');
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 30));
  });

  expect(addFavorite).toHaveBeenCalledWith('video-001');
  expect(
    renderer.root.findAllByProps({ accessibilityLabel: 'Убрать из избранного' }).length,
  ).toBeGreaterThan(0);

  await saveFavoriteIds(['video-001']);

  await ReactTestRenderer.act(async () => {
    pressFavorite('Убрать из избранного');
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 30));
  });

  expect(removeFavorite).toHaveBeenCalledWith('video-001');
  expect(await loadFavoriteIds()).toEqual([]);
  expect(
    renderer.root.findAllByProps({ accessibilityLabel: 'В избранное' }).length,
  ).toBeGreaterThan(0);

  await ReactTestRenderer.act(() => {
    renderer.unmount();
  });
});
