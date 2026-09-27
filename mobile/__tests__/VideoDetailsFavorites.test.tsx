import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ReactTestRenderer from 'react-test-renderer';
import { createAsyncStorage } from '@react-native-async-storage/async-storage/jest';

import { videoKeys } from '../src/api/videoQueries';
import { sampleVideo } from '../testFixtures/video';
import { RootRoute } from '../src/navigation/routes';
import { VideoDetailsScreen } from '../src/screens/VideoDetailsScreen';
import { useFavoritesStore } from '../src/store/useFavoritesStore';

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({ colors: { background: '#FFFFFF', text: '#111111' }, dark: false }),
}));

jest.mock('../src/components/player/RutubeVideoPlayer', () => 'MockVideoPlayer');

const storage = createAsyncStorage('streamboxFavorites');

beforeEach(async () => {
  await storage.clear();
  useFavoritesStore.setState({
    error: null,
    favoriteIds: [],
    isSaving: false,
    status: 'ready',
  });
});

it('кнопка VideoDetails добавляет и удаляет видео, обновляя своё состояние', async () => {
  const props = {
    navigation: { goBack: jest.fn() },
    route: { key: 'details', name: RootRoute.VideoDetails, params: { videoId: 'video-001' } },
  } as unknown as Parameters<typeof VideoDetailsScreen>[0];
  let renderer!: ReactTestRenderer.ReactTestRenderer;

  const queryClient = new QueryClient({ defaultOptions: { queries: { gcTime: 0 } } });
  queryClient.setQueryData(videoKeys.detail('video-001'), sampleVideo);
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
    await Promise.resolve();
  });

  expect(useFavoritesStore.getState().favoriteIds).toEqual(['video-001']);
  expect(
    renderer.root.findAllByProps({ accessibilityLabel: 'Убрать из избранного' }).length,
  ).toBeGreaterThan(0);

  await ReactTestRenderer.act(async () => {
    pressFavorite('Убрать из избранного');
    await Promise.resolve();
  });

  expect(useFavoritesStore.getState().favoriteIds).toEqual([]);
  expect(
    renderer.root.findAllByProps({ accessibilityLabel: 'В избранное' }).length,
  ).toBeGreaterThan(0);

  await ReactTestRenderer.act(() => {
    renderer.unmount();
  });
});
