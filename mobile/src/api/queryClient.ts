import { QueryClient } from '@tanstack/react-query';

import { ApiError } from './client';

const shouldRetry = (attempt: number, error: Error): boolean =>
  attempt < 2 &&
  !(
    error instanceof ApiError &&
    ['not-found', 'invalid-request', 'invalid-response', 'unauthorized', 'forbidden'].includes(
      error.kind,
    )
  );

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: shouldRetry,
      refetchOnReconnect: true,
    },
  },
});
