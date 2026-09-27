import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  addFavorite,
  clearFavorites,
  clearHistory,
  clearProgress,
  recordWatch,
  removeFavorite,
  removeProgress,
  saveProgress,
  type FavoriteRecord,
} from '../api/me';
import { userKeys, userQueries } from '../api/userQueries';
import { loadFavoriteIds, saveFavoriteIds } from '../storage/favorites';
import { saveWatchHistory } from '../storage/watchHistory';
import { clearAllVideoProgress, clearVideoProgress } from '../storage/videoProgress';
import { drainUserWrites } from '../services/userWriteQueue';

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
      if (remove) {
        await removeFavorite(videoId);
        const legacyIds = await loadFavoriteIds();
        if (legacyIds.includes(videoId))
          await saveFavoriteIds(legacyIds.filter((id) => id !== videoId));
      } else await addFavorite(videoId);
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
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
};

export const useClearUserData = (userId: string) => {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['users', userId] });
  return {
    favorites: useMutation({
      mutationFn: async () => {
        await clearFavorites();
        await saveFavoriteIds([]);
      },
      onSettled: invalidate,
    }),
    history: useMutation({
      mutationFn: async () => {
        await drainUserWrites(userId);
        await clearHistory();
        await saveWatchHistory([]);
      },
      onSettled: invalidate,
    }),
    progress: useMutation({
      mutationFn: async () => {
        await drainUserWrites(userId);
        await clearProgress();
        await clearAllVideoProgress();
      },
      onSettled: invalidate,
    }),
  };
};

export const useRecordWatch = (userId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (videoId: string) => recordWatch(videoId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.history(userId) }),
  });
};

export const useSaveProgress = (userId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      videoId,
      position,
      duration,
    }: {
      videoId: string;
      position: number;
      duration: number;
    }) => saveProgress(videoId, position, duration),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.progress(userId) });
      queryClient.invalidateQueries({
        queryKey: userKeys.videoProgress(userId, variables.videoId),
      });
    },
  });
};

export const useRemoveProgress = (userId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (videoId: string) => {
      await removeProgress(videoId);
      await clearVideoProgress(videoId);
    },
    onSuccess: (_result, videoId) => {
      queryClient.invalidateQueries({ queryKey: userKeys.progress(userId) });
      queryClient.invalidateQueries({ queryKey: userKeys.videoProgress(userId, videoId) });
    },
  });
};
