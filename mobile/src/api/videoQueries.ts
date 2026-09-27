import { queryOptions } from '@tanstack/react-query';

import { getVideo, getVideos } from './videos';

export const videoKeys = {
  all: ['videos'],
  lists: () => [...videoKeys.all, 'list'],
  list: (search = '') => [...videoKeys.lists(), search],
  details: () => [...videoKeys.all, 'detail'],
  detail: (id: string) => [...videoKeys.details(), id],
  playback: (id: string) => [...videoKeys.all, 'playback', id],
};

export const videoQueries = {
  list: (search = '') =>
    queryOptions({
      queryKey: videoKeys.list(search),
      queryFn: ({ signal }) => getVideos(search, signal),
      staleTime: 60_000,
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: videoKeys.detail(id),
      queryFn: ({ signal }) => getVideo(id, signal),
      staleTime: 60_000,
    }),
};
