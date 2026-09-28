import { queryOptions } from '@tanstack/react-query';

import { getCurrentUser, getFavorites, getHistory, getProgress, getVideoProgress } from './me';
import { userKeys } from './userKeys';
import {
  overlayPendingFavorites,
  overlayPendingHistory,
  overlayPendingProgress,
} from '../services/offlineQueue';

export { userKeys } from './userKeys';

export const userQueries = {
  me: () =>
    queryOptions({
      queryKey: userKeys.me,
      queryFn: ({ signal }) => getCurrentUser(signal),
      staleTime: 60_000,
    }),
  favorites: (userId: string) =>
    queryOptions({
      queryKey: userKeys.favorites(userId),
      queryFn: async ({ signal }) => overlayPendingFavorites(userId, await getFavorites(signal)),
      staleTime: 15_000,
    }),
  history: (userId: string) =>
    queryOptions({
      queryKey: userKeys.history(userId),
      queryFn: async ({ signal }) => overlayPendingHistory(userId, await getHistory(signal)),
      staleTime: 15_000,
    }),
  progress: (userId: string) =>
    queryOptions({
      queryKey: userKeys.progress(userId),
      queryFn: async ({ signal }) => overlayPendingProgress(userId, await getProgress(signal)),
      staleTime: 15_000,
    }),
  videoProgress: (userId: string, videoId: string) =>
    queryOptions({
      queryKey: userKeys.videoProgress(userId, videoId),
      queryFn: async ({ signal }) => {
        const record = await getVideoProgress(videoId, signal);
        const records = overlayPendingProgress(userId, record ? [record] : []);
        return records.find((item) => item.videoId === videoId) ?? null;
      },
      staleTime: 0,
    }),
};
