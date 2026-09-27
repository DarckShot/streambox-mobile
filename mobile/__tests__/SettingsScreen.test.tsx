import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ReactTestRenderer from 'react-test-renderer';
import { Alert, Text } from 'react-native';

import { clearFavorites } from '../src/api/me';
import { userKeys } from '../src/api/userQueries';
import { SettingsScreen } from '../src/screens/SettingsScreen';

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({ colors: { background: '#FFFFFF', text: '#111111' }, dark: false }),
}));
jest.mock('../src/api/me', () => ({
  getCurrentUser: jest.fn(async () => ({ id: 'user-1', email: 'test@example.com' })),
  getFavorites: jest.fn(async () => []),
  getHistory: jest.fn(async () => []),
  getProgress: jest.fn(async () => []),
  clearFavorites: jest.fn(async () => undefined),
  clearHistory: jest.fn(async () => undefined),
  clearProgress: jest.fn(async () => undefined),
}));

it('очищает избранное только после подтверждения', async () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  queryClient.setQueryData(userKeys.me, { id: 'user-1', email: 'test@example.com' });
  queryClient.setQueryData(userKeys.favorites('user-1'), [
    { videoId: 'video-001', createdAt: new Date().toISOString() },
  ]);
  queryClient.setQueryData(userKeys.history('user-1'), []);
  queryClient.setQueryData(userKeys.progress('user-1'), []);
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  let renderer!: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(
      <QueryClientProvider client={queryClient}>
        <SettingsScreen />
      </QueryClientProvider>,
    );
  });

  let favoriteRow: ReactTestRenderer.ReactTestInstance | null | undefined = renderer.root
    .findAllByType(Text)
    .find((node) => node.props.children === 'Очистить избранное');
  while (favoriteRow && typeof favoriteRow.props.onPress !== 'function') {
    favoriteRow = favoriteRow.parent;
  }
  expect(favoriteRow?.props.onPress).toBeDefined();
  await ReactTestRenderer.act(() => favoriteRow?.props.onPress());
  expect(clearFavorites).not.toHaveBeenCalled();

  const confirm = alert.mock.calls[0]?.[2]?.find((button) => button.text === 'Удалить');
  await ReactTestRenderer.act(async () => {
    confirm?.onPress?.();
    await Promise.resolve();
  });
  expect(clearFavorites).toHaveBeenCalledTimes(1);

  await ReactTestRenderer.act(() => renderer.unmount());
  queryClient.clear();
  alert.mockRestore();
});
