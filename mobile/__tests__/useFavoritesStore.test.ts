import { createAsyncStorage } from '@react-native-async-storage/async-storage/jest';

import { useFavoritesStore } from '../src/store/useFavoritesStore';

const storage = createAsyncStorage('streamboxFavorites');

beforeEach(async () => {
  await storage.clear();
  useFavoritesStore.setState({
    error: null,
    favoriteIds: [],
    isSaving: false,
    status: 'idle',
  });
});

it('добавляет, удаляет и восстанавливает избранное без дубликатов', async () => {
  await useFavoritesStore.getState().loadFavorites();
  expect(useFavoritesStore.getState().status).toBe('ready');

  const firstPress = useFavoritesStore.getState().toggleFavorite('video-001');
  const rapidSecondPress = useFavoritesStore.getState().toggleFavorite('video-001');
  expect(useFavoritesStore.getState().favoriteIds).toEqual(['video-001']);
  await Promise.all([firstPress, rapidSecondPress]);

  await useFavoritesStore.getState().toggleFavorite('video-002');
  await useFavoritesStore.getState().toggleFavorite('bad id');
  expect(useFavoritesStore.getState().favoriteIds).toEqual(['video-001', 'video-002']);

  useFavoritesStore.setState({ favoriteIds: [], status: 'idle' });
  await useFavoritesStore.getState().loadFavorites();
  expect(useFavoritesStore.getState().favoriteIds).toEqual(['video-001', 'video-002']);

  await useFavoritesStore.getState().toggleFavorite('video-001');
  expect(useFavoritesStore.getState().favoriteIds).toEqual(['video-002']);
  expect(await storage.getItem('videoIds')).toBe('["video-002"]');
});

it('при ошибке записи возвращает прежнее состояние и показывает ошибку', async () => {
  await useFavoritesStore.getState().loadFavorites();
  const warning = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  const write = jest
    .spyOn(storage, 'setItem')
    .mockRejectedValueOnce(new Error('storage unavailable'));

  await useFavoritesStore.getState().toggleFavorite('video-001');

  expect(useFavoritesStore.getState()).toMatchObject({
    error: 'Не удалось сохранить изменение. Попробуйте ещё раз.',
    favoriteIds: [],
    isSaving: false,
  });
  expect(warning).toHaveBeenCalledTimes(1);

  write.mockRestore();
  warning.mockRestore();
});

it('при ошибке чтения не выдаёт пустой список за корректно загруженное избранное', async () => {
  const warning = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  const read = jest
    .spyOn(storage, 'getItem')
    .mockRejectedValueOnce(new Error('storage unavailable'));

  await useFavoritesStore.getState().loadFavorites();
  expect(useFavoritesStore.getState().status).toBe('error');

  read.mockRestore();
  await useFavoritesStore.getState().loadFavorites();
  expect(useFavoritesStore.getState().status).toBe('ready');
  warning.mockRestore();
});
