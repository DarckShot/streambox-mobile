import { QueryClient } from '@tanstack/react-query';

import { ApiError } from './client';

export const shouldRetry = (attempt: number, error: Error): boolean =>
  attempt < 2 &&
  error instanceof ApiError &&
  (error.kind === 'network' ||
    error.kind === 'timeout' ||
    (error.kind === 'server' && [500, 502, 503, 504].includes(error.status ?? 0)));

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 7 * 24 * 60 * 60_000,
      retry: shouldRetry,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 5000),
      refetchOnReconnect: true,
      refetchOnWindowFocus: true,
    },
  },
});
