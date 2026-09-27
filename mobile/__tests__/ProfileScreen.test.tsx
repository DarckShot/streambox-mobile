import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { ScrollView, Text } from 'react-native';

import { RootRoute, TabRoute } from '../src/navigation/routes';
import { ProfileScreen } from '../src/screens/ProfileScreen';
import { useFavoritesStore } from '../src/store/useFavoritesStore';
import { useWatchHistoryStore } from '../src/store/useWatchHistoryStore';
import { useSavedProgressStore } from '../src/store/useSavedProgressStore';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
  useTheme: () => ({ colors: { background: '#FFFFFF', text: '#111111' }, dark: false }),
}));

beforeEach(() => {
  mockNavigate.mockClear();
  useFavoritesStore.setState({ favoriteIds: [], status: 'ready' });
  useWatchHistoryStore.setState({ entries: [], loaded: true });
  useSavedProgressStore.setState({ positions: {}, loaded: true });
});

it('показывает актуальные счётчики и открывает персональные разделы', async () => {
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<ProfileScreen />);
  });

  expect(renderer.root.findAllByType(ScrollView)).toHaveLength(0);

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

  await ReactTestRenderer.act(() => {
    useSavedProgressStore.setState({ positions: { 'video-001': 12 } });
  });
  expect(
    renderer.root
      .findAllByType(Text)
      .some((node) => node.props.children === 'Пока нет сохранённых видео'),
  ).toBe(false);

  await ReactTestRenderer.act(() => {
    useFavoritesStore.setState({ favoriteIds: ['video-001'] });
    useWatchHistoryStore.setState({
      entries: [{ videoId: 'video-002', lastWatchedAt: 1000, position: 12, duration: 60 }],
    });
    useSavedProgressStore.setState({ positions: { 'video-001': 12 } });
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
