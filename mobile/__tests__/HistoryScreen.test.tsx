import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ReactTestRenderer from 'react-test-renderer';
import { Text } from 'react-native';

import { userKeys } from '../src/api/userQueries';
import { videoKeys } from '../src/api/videoQueries';
import { RootRoute } from '../src/navigation/routes';
import { HistoryScreen } from '../src/screens/HistoryScreen';
import { sampleVideo } from '../testFixtures/video';

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
      data: Array<{ video: { id: string } }>;
      renderItem: (info: { item: { video: { id: string } }; index: number }) => React.ReactElement;
    }) =>
      ReactModule.createElement(
        View,
        null,
        data.map((item, index) =>
          ReactModule.createElement(View, { key: item.video.id }, renderItem({ item, index })),
        ),
      ),
  };
});

it('показывает начатый просмотр без сохранённой позиции и открывает видео', async () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  queryClient.setQueryData(userKeys.me, { id: 'user-1', email: 'test@example.com' });
  queryClient.setQueryData(userKeys.history('user-1'), [
    { videoId: sampleVideo.id, lastWatchedAt: '2026-09-28T01:00:00.000Z', completed: false },
  ]);
  queryClient.setQueryData(userKeys.progress('user-1'), []);
  queryClient.setQueryData(videoKeys.detail(sampleVideo.id), sampleVideo);
  let renderer!: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(
      <QueryClientProvider client={queryClient}>
        <HistoryScreen />
      </QueryClientProvider>,
    );
  });

  expect(
    renderer.root.findAllByType(Text).some((node) => node.props.children === 'Просмотр начат'),
  ).toBe(true);
  const card = renderer.root.findAllByProps({
    accessibilityLabel: 'Документальный фильм про космос, Наука, 54:13',
  })[0];
  await ReactTestRenderer.act(() => card.props.onPress());
  expect(mockNavigate).toHaveBeenCalledWith(RootRoute.VideoDetails, { videoId: sampleVideo.id });

  await ReactTestRenderer.act(() => renderer.unmount());
  queryClient.clear();
});
