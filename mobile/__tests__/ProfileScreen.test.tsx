import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ReactTestRenderer from 'react-test-renderer';
import { ScrollView, Text } from 'react-native';

import { RootRoute, TabRoute } from '../src/navigation/routes';
import { ProfileScreen } from '../src/screens/ProfileScreen';
import { userKeys } from '../src/api/userQueries';

jest.mock('../src/auth/AuthProvider', () => ({
  useAuth: () => ({ logout: jest.fn(), migrationStatus: 'complete' }),
}));

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
  useTheme: () => ({ colors: { background: '#FFFFFF', text: '#111111' }, dark: false }),
}));

beforeEach(() => {
  mockNavigate.mockClear();
});

it('показывает актуальные счётчики и открывает персональные разделы', async () => {
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  queryClient.setQueryData(userKeys.me, { id: 'user-1', email: 'test@example.com' });
  queryClient.setQueryData(userKeys.favorites('user-1'), []);
  queryClient.setQueryData(userKeys.history('user-1'), []);
  queryClient.setQueryData(userKeys.progress('user-1'), []);
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(
      <QueryClientProvider client={queryClient}>
        <ProfileScreen />
      </QueryClientProvider>,
    );
  });

  expect(renderer.root.findAllByType(ScrollView)).toHaveLength(1);

  expect(
    renderer.root.findAllByProps({ accessibilityLabel: '0 в избранном' }).length,
  ).toBeGreaterThan(0);
  expect(
    renderer.root.findAllByProps({ accessibilityLabel: '0 просмотрено' }).length,
  ).toBeGreaterThan(0);
  expect(
    renderer.root
      .findAllByType(Text)
      .some((node) => node.props.children === 'Пока нет сохранённых видео'),
  ).toBe(true);

  await ReactTestRenderer.act(async () => {
    queryClient.setQueryData(userKeys.progress('user-1'), [
      {
        videoId: 'video-001',
        positionSeconds: 12,
        durationSeconds: 60,
        updatedAt: new Date().toISOString(),
      },
    ]);
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 30));
  });
  expect(
    renderer.root
      .findAllByType(Text)
      .some((node) => node.props.children === 'Пока нет сохранённых видео'),
  ).toBe(false);

  await ReactTestRenderer.act(async () => {
    queryClient.setQueryData(userKeys.favorites('user-1'), [
      { videoId: 'video-001', createdAt: new Date().toISOString() },
    ]);
    queryClient.setQueryData(userKeys.history('user-1'), [
      { videoId: 'video-002', lastWatchedAt: new Date().toISOString(), completed: false },
    ]);
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 30));
  });
  expect(
    renderer.root.findAllByProps({ accessibilityLabel: '1 в избранном' }).length,
  ).toBeGreaterThan(0);
  expect(
    renderer.root.findAllByProps({ accessibilityLabel: '1 просмотрено' }).length,
  ).toBeGreaterThan(0);
  expect(
    renderer.root.findAllByProps({ accessibilityLabel: '1 с сохранённым прогрессом' }).length,
  ).toBeGreaterThan(0);
  expect(
    renderer.root
      .findAllByType(Text)
      .some((node) => node.props.children === 'Пока нет сохранённых видео'),
  ).toBe(false);

  for (const [label, route] of [
    ['Избранное', TabRoute.Favorites],
    ['История просмотра', RootRoute.History],
    ['Настройки', RootRoute.Settings],
  ]) {
    await ReactTestRenderer.act(() => {
      renderer.root
        .findAllByProps({ accessibilityLabel: label })
        .find((node) => typeof node.props.onPress === 'function')!
        .props.onPress();
    });
    expect(mockNavigate).toHaveBeenLastCalledWith(route);
  }

  await ReactTestRenderer.act(() => renderer.unmount());
});
