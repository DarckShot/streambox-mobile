import { useQueries } from '@tanstack/react-query';

import { videoQueries } from '../api/videoQueries';
import type { Video } from '../types/video';

interface VideosByIds {
  byId: Map<string, Video>;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useVideosByIds = (ids: string[]): VideosByIds => {
  const queries = useQueries({ queries: ids.map((id) => videoQueries.detail(id)) });
  const byId = new Map<string, Video>();
  queries.forEach((query, index) => {
    if (query.data) byId.set(ids[index], query.data);
  });
  return {
    byId,
    isLoading: queries.some((query) => query.isPending),
    error: queries.find((query) => query.error)?.error ?? null,
    refetch: () => {
      queries.forEach((query) => {
        if (query.isError) query.refetch();
      });
    },
  };
};
