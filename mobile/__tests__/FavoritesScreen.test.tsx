import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ReactTestRenderer from 'react-test-renderer';
import { Text } from 'react-native';

import { videoKeys } from '../src/api/videoQueries';
import { sampleVideo } from '../testFixtures/video';
import { RootRoute, TabRoute } from '../src/navigation/routes';
import { FavoritesScreen } from '../src/screens/FavoritesScreen';
import { useFavoritesStore } from '../src/store/useFavoritesStore';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
  useTheme: () => ({ colors: { background: '#FFFFFF', text: '#111111' }, dark: false }),
}));

jest.mock('@shopify/flash-list', () => {
  const ReactModule = require('react');
  const { View } = require('react-native');

  return {
    FlashList: ({
      data,
      renderItem,
    }: {
      data: Array<{ id: string }>;
      renderItem: (info: { item: { id: string }; index: number }) => React.ReactElement;
    }) =>
      ReactModule.createElement(
        View,
        null,
        data.map((item, index) =>
          ReactModule.createElement(View, { key: item.id }, renderItem({ item, index })),
        ),
      ),
  };
});

beforeEach(() => {
  mockNavigate.mockClear();
  useFavoritesStore.setState({
    error: null,
    favoriteIds: ['video-001'],
    isSaving: false,
    status: 'ready',
  });
});

it('открывает видео из избранного и сразу убирает его карточку после удаления', async () => {
  let renderer!: ReactTestRenderer.ReactTestRenderer;

  const queryClient = new QueryClient({ defaultOptions: { queries: { gcTime: 0 } } });
  queryClient.setQueryData(videoKeys.detail('video-001'), sampleVideo);
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(
      <QueryClientProvider client={queryClient}>
        <FavoritesScreen />
      </QueryClientProvider>,
    );
  });

  const cardLabel = 'Документальный фильм про космос, Наука, 54:13';
  expect(renderer.root.findAllByProps({ accessibilityLabel: cardLabel }).length).toBeGreaterThan(0);
  await ReactTestRenderer.act(() => {
    renderer.root
      .findAllByProps({ accessibilityLabel: cardLabel })
      .find((node) => typeof node.props.onPress === 'function')!
      .props.onPress();
  });
  expect(mockNavigate).toHaveBeenCalledWith(RootRoute.VideoDetails, { videoId: 'video-001' });

  await ReactTestRenderer.act(() => {
    useFavoritesStore.setState({ favoriteIds: [] });
  });

  expect(renderer.root.findAllByProps({ accessibilityLabel: cardLabel })).toHaveLength(0);
  expect(
    renderer.root.findAllByType(Text).some((node) => node.props.children === 'Здесь пока пусто'),
  ).toBe(true);

  await ReactTestRenderer.act(() => {
    renderer.root.findByProps({ accessibilityRole: 'button' }).props.onPress();
  });
  expect(mockNavigate).toHaveBeenLastCalledWith(TabRoute.Home);

  await ReactTestRenderer.act(() => {
    renderer.unmount();
  });
});
