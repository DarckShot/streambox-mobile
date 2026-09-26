import { createAsyncStorage } from '@react-native-async-storage/async-storage/jest';

import { loadFavoriteIds, saveFavoriteIds } from '../src/storage/favorites';

const storage = createAsyncStorage('streamboxFavorites');

beforeEach(async () => {
  await storage.clear();
});

it('сохраняет уникальные ID известных видео и читает их после нового обращения к хранилищу', async () => {
  await saveFavoriteIds(['video-001', 'video-001', 'unknown', 'video-002']);

  expect(await loadFavoriteIds()).toEqual(['video-001', 'video-002']);
  expect(await storage.getItem('videoIds')).toBe('["video-001","video-002"]');
});

it('безопасно обрабатывает пустые и повреждённые данные', async () => {
  expect(await loadFavoriteIds()).toEqual([]);

  await storage.setItem('videoIds', 'not JSON');
  expect(await loadFavoriteIds()).toEqual([]);

  await storage.setItem('videoIds', JSON.stringify(['video-003', 4, 'video-003', 'removed']));
  expect(await loadFavoriteIds()).toEqual(['video-003']);
});
