import AsyncStorage from '@react-native-async-storage/async-storage';
import { dehydrate, hydrate, type QueryClient } from '@tanstack/react-query';

const CACHE_VERSION = 1;
const MAX_AGE_MS = 7 * 24 * 60 * 60_000;
const publicKey = `streambox.query.public.v${CACHE_VERSION}`;
const privateKey = (userId: string): string =>
  `streambox.query.user.${encodeURIComponent(userId)}.v${CACHE_VERSION}`;

interface StoredCache {
  savedAt: number;
  state: ReturnType<typeof dehydrate>;
}

const restore = async (
  client: QueryClient,
  key: string,
  allowed: (queryKey: readonly unknown[], data: unknown) => boolean,
): Promise<void> => {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return;
    const data: StoredCache = JSON.parse(raw);
    if (!data || !Number.isFinite(data.savedAt) || Date.now() - data.savedAt > MAX_AGE_MS) return;
    hydrate(client, {
      ...data.state,
      queries: data.state.queries.filter(
        (query) =>
          Date.now() - query.state.dataUpdatedAt < MAX_AGE_MS &&
          allowed(query.queryKey, query.state.data),
      ),
    });
  } catch {
    // Повреждённый кеш не должен блокировать запуск приложения.
  }
};

export const restorePublicCache = (client: QueryClient): Promise<void> =>
  restore(client, publicKey, (key) => key[0] === 'videos' && key[1] !== 'playback');
export const restoreUserCache = (client: QueryClient, userId: string): Promise<void> =>
  restore(
    client,
    privateKey(userId),
    (key, data) =>
      (key[0] === 'users' && key[1] === userId) ||
      (key[0] === 'session' &&
        key[1] === 'me' &&
        typeof data === 'object' &&
        data !== null &&
        'id' in data &&
        data.id === userId),
  );

export const startQueryPersistence = (client: QueryClient): (() => void) => {
  let timer: ReturnType<typeof setTimeout> | null = null;
  const save = async (): Promise<void> => {
    timer = null;
    const queries = client.getQueryCache().getAll();
    const userIds = new Set<string>();
    for (const query of queries) {
      if (query.queryKey[0] === 'users' && typeof query.queryKey[1] === 'string')
        userIds.add(query.queryKey[1]);
    }
    const serialize = (predicate: (key: readonly unknown[]) => boolean): string =>
      JSON.stringify({
        savedAt: Date.now(),
        state: dehydrate(client, {
          shouldDehydrateQuery: (query) =>
            query.state.status === 'success' &&
            Date.now() - query.state.dataUpdatedAt < MAX_AGE_MS &&
            predicate(query.queryKey),
        }),
      } satisfies StoredCache);
    await AsyncStorage.setItem(
      publicKey,
      serialize((key) => key[0] === 'videos' && key[1] !== 'playback'),
    );
    await Promise.all(
      [...userIds].map((userId) =>
        AsyncStorage.setItem(
          privateKey(userId),
          serialize(
            (key) =>
              (key[0] === 'users' && key[1] === userId) ||
              (key[0] === 'session' &&
                key[1] === 'me' &&
                client.getQueryData<{ id: string }>(['session', 'me'])?.id === userId),
          ),
        ),
      ),
    );
  };
  const unsubscribe = client.getQueryCache().subscribe(() => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      void save().catch(() => console.warn('Не удалось сохранить offline-кеш.'));
    }, 1000);
  });
  return () => {
    unsubscribe();
    if (timer) clearTimeout(timer);
  };
};
