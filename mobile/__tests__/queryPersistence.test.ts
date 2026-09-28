import AsyncStorage from '@react-native-async-storage/async-storage';
import { dehydrate, QueryClient } from '@tanstack/react-query';

import { restorePublicCache, restoreUserCache } from '../src/services/queryPersistence';
import { userKeys } from '../src/api/userKeys';

it('восстанавливает приватный кеш только запрошенного аккаунта', async () => {
  const source = new QueryClient();
  source.setQueryData(userKeys.favorites('cache-user-a'), [
    { videoId: 'video-a', createdAt: 'now' },
  ]);
  source.setQueryData(userKeys.favorites('cache-user-b'), [
    { videoId: 'video-b', createdAt: 'now' },
  ]);
  const state = dehydrate(source);
  await AsyncStorage.setItem(
    'streambox.query.user.cache-user-a.v1',
    JSON.stringify({
      savedAt: Date.now(),
      state,
    }),
  );

  const target = new QueryClient();
  await restoreUserCache(target, 'cache-user-b');
  expect(target.getQueryData(userKeys.favorites('cache-user-a'))).toBeUndefined();
  await restoreUserCache(target, 'cache-user-a');
  expect(target.getQueryData(userKeys.favorites('cache-user-a'))).toEqual([
    { videoId: 'video-a', createdAt: 'now' },
  ]);
  expect(target.getQueryData(userKeys.favorites('cache-user-b'))).toBeUndefined();
});

it('не восстанавливает устаревшие публичные данные', async () => {
  const source = new QueryClient();
  source.setQueryData(['videos', 'list', ''], [{ id: 'old' }], {
    updatedAt: Date.now() - 8 * 24 * 60 * 60_000,
  });
  await AsyncStorage.setItem(
    'streambox.query.public.v1',
    JSON.stringify({
      savedAt: Date.now(),
      state: dehydrate(source),
    }),
  );
  const target = new QueryClient();
  await restorePublicCache(target);
  expect(target.getQueryData(['videos', 'list', ''])).toBeUndefined();
});
