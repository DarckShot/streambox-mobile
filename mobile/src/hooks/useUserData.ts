import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { clearFavorites, clearHistory, clearProgress, type FavoriteRecord } from '../api/me';
import { userKeys, userQueries } from '../api/userQueries';
import { loadFavoriteIds, saveFavoriteIds } from '../storage/favorites';
import { saveWatchHistory } from '../storage/watchHistory';
import { clearAllVideoProgress } from '../storage/videoProgress';
import { drainUserWrites } from '../services/userWriteQueue';
import {
  discardOfflineActions,
  drainOfflineSync,
  stageOfflineAction,
  syncOfflineQueue,
} from '../services/offlineQueue';

export const useCurrentUser = () => useQuery(userQueries.me());

export const useUserCollections = () => {
  const user = useCurrentUser();
  const userId = user.data?.id ?? '';
  const favorites = useQuery({ ...userQueries.favorites(userId), enabled: Boolean(userId) });
  const history = useQuery({ ...userQueries.history(userId), enabled: Boolean(userId) });
  const progress = useQuery({ ...userQueries.progress(userId), enabled: Boolean(userId) });
  return { user, userId, favorites, history, progress };
};

export const useFavoriteMutation = (userId: string) => {
  const queryClient = useQueryClient();
  const key = userKeys.favorites(userId);
  return useMutation({
    mutationFn: async ({ videoId, remove }: { videoId: string; remove: boolean }) => {
      await stageOfflineAction(userId, { kind: 'favorite', videoId, present: !remove });
      void syncOfflineQueue(userId);
      if (remove) {
        const legacyIds = await loadFavoriteIds();
        if (legacyIds.includes(videoId))
          await saveFavoriteIds(legacyIds.filter((id) => id !== videoId));
      }
    },
    onMutate: async ({ videoId, remove }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<FavoriteRecord[]>(key);
      queryClient.setQueryData<FavoriteRecord[]>(key, (current = []) =>
        remove
          ? current.filter((item) => item.videoId !== videoId)
          : current.some((item) => item.videoId === videoId)
          ? current
          : [{ videoId, createdAt: new Date().toISOString() }, ...current],
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSettled: () => undefined,
  });
};

export const useClearUserData = (userId: string) => {
  const queryClient = useQueryClient();
  const invalidate = () => {
    void syncOfflineQueue(userId);
    return queryClient.invalidateQueries({ queryKey: ['users', userId] });
  };
  return {
    favorites: useMutation({
      mutationFn: async () => {
        await drainOfflineSync(userId);
        await clearFavorites();
        await discardOfflineActions(userId, 'favorite');
        await saveFavoriteIds([]);
      },
      onSettled: invalidate,
    }),
    history: useMutation({
      mutationFn: async () => {
        await drainUserWrites(userId);
        await drainOfflineSync(userId);
        await clearHistory();
        await discardOfflineActions(userId, 'history');
        await saveWatchHistory([]);
      },
      onSettled: invalidate,
    }),
    progress: useMutation({
      mutationFn: async () => {
        await drainUserWrites(userId);
        await drainOfflineSync(userId);
        await clearProgress();
        await discardOfflineActions(userId, 'progress');
        await clearAllVideoProgress();
      },
      onSettled: invalidate,
    }),
  };
};
