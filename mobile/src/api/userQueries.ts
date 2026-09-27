import { queryOptions } from '@tanstack/react-query';

import { getCurrentUser, getFavorites, getHistory, getProgress, getVideoProgress } from './me';

export const userKeys = {
  me: ['session', 'me'],
  favorites: (userId: string) => ['users', userId, 'favorites'],
  history: (userId: string) => ['users', userId, 'history'],
  progress: (userId: string) => ['users', userId, 'progress'],
  videoProgress: (userId: string, videoId: string) => ['users', userId, 'progress', videoId],
};

export const userQueries = {
  me: () => queryOptions({ queryKey: userKeys.me, queryFn: getCurrentUser, staleTime: 60_000 }),
  favorites: (userId: string) =>
    queryOptions({
      queryKey: userKeys.favorites(userId),
      queryFn: getFavorites,
      staleTime: 15_000,
    }),
  history: (userId: string) =>
    queryOptions({ queryKey: userKeys.history(userId), queryFn: getHistory, staleTime: 15_000 }),
  progress: (userId: string) =>
    queryOptions({ queryKey: userKeys.progress(userId), queryFn: getProgress, staleTime: 15_000 }),
  videoProgress: (userId: string, videoId: string) =>
    queryOptions({
      queryKey: userKeys.videoProgress(userId, videoId),
      queryFn: () => getVideoProgress(videoId),
      staleTime: 0,
    }),
};
