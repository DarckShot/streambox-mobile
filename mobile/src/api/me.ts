import { ApiError, apiClient, toApiError } from './client';

export interface CurrentUser {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}
export interface FavoriteRecord {
  videoId: string;
  createdAt: string;
}
export interface HistoryRecord {
  videoId: string;
  lastWatchedAt: string;
  completed: boolean;
}
export interface ProgressRecord {
  videoId: string;
  positionSeconds: number;
  durationSeconds: number;
  updatedAt: string;
}

const request = async <T>(operation: () => Promise<{ data: T }>): Promise<T> => {
  try {
    return (await operation()).data;
  } catch (error: unknown) {
    const normalized = toApiError(error);
    if (normalized.kind !== 'cancelled')
      console.warn(
        'Ошибка пользовательского API:',
        normalized.kind,
        normalized.status ?? 'network',
      );
    throw normalized;
  }
};
const list = <T>(value: unknown, valid: (item: unknown) => item is T): T[] => {
  if (!Array.isArray(value) || !value.every(valid))
    throw new ApiError('invalid-response', 'Сервер вернул неверные пользовательские данные.');
  return value;
};
const object = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const validFavorite = (value: unknown): value is FavoriteRecord =>
  object(value) && typeof value.videoId === 'string' && typeof value.createdAt === 'string';
const validHistory = (value: unknown): value is HistoryRecord =>
  object(value) &&
  typeof value.videoId === 'string' &&
  typeof value.lastWatchedAt === 'string' &&
  typeof value.completed === 'boolean';
const validProgress = (value: unknown): value is ProgressRecord =>
  object(value) &&
  typeof value.videoId === 'string' &&
  typeof value.positionSeconds === 'number' &&
  Number.isFinite(value.positionSeconds) &&
  typeof value.durationSeconds === 'number' &&
  Number.isFinite(value.durationSeconds) &&
  typeof value.updatedAt === 'string';

export const getCurrentUser = async (signal?: AbortSignal): Promise<CurrentUser> => {
  const data = await request(() => apiClient.get<unknown>('/users/me', { signal }));
  if (
    typeof data !== 'object' ||
    data === null ||
    !('id' in data) ||
    !('email' in data) ||
    typeof data.id !== 'string' ||
    typeof data.email !== 'string'
  ) {
    throw new ApiError('invalid-response', 'Сервер вернул неверные данные пользователя.');
  }
  return data as CurrentUser;
};
export const getFavorites = async (signal?: AbortSignal): Promise<FavoriteRecord[]> =>
  list(await request(() => apiClient.get<unknown>('/me/favorites', { signal })), validFavorite);
export const addFavorite = async (videoId: string): Promise<FavoriteRecord> =>
  request(() => apiClient.post<FavoriteRecord>(`/me/favorites/${encodeURIComponent(videoId)}`));
export const removeFavorite = async (videoId: string): Promise<void> => {
  await request(() => apiClient.delete(`/me/favorites/${encodeURIComponent(videoId)}`));
};
export const clearFavorites = async (): Promise<void> => {
  await request(() => apiClient.delete('/me/favorites'));
};

export const getHistory = async (signal?: AbortSignal): Promise<HistoryRecord[]> =>
  list(await request(() => apiClient.get<unknown>('/me/history', { signal })), validHistory);
export const recordWatch = async (
  videoId: string,
  watchedAt?: string,
  completed = false,
): Promise<HistoryRecord> =>
  request(() =>
    apiClient.put<HistoryRecord>(`/me/history/${encodeURIComponent(videoId)}`, {
      watchedAt,
      completed,
    }),
  );
export const removeHistory = async (videoId: string): Promise<void> => {
  await request(() => apiClient.delete(`/me/history/${encodeURIComponent(videoId)}`));
};
export const clearHistory = async (): Promise<void> => {
  await request(() => apiClient.delete('/me/history'));
};

export const getProgress = async (signal?: AbortSignal): Promise<ProgressRecord[]> =>
  list(await request(() => apiClient.get<unknown>('/me/progress', { signal })), validProgress);
export const getVideoProgress = async (
  videoId: string,
  signal?: AbortSignal,
): Promise<ProgressRecord | null> => {
  const data =
    (await request(() =>
      apiClient.get<ProgressRecord | null | ''>(`/me/progress/${encodeURIComponent(videoId)}`, {
        signal,
      }),
    )) || null;
  if (data !== null && !validProgress(data))
    throw new ApiError('invalid-response', 'Сервер вернул неверный прогресс просмотра.');
  return data;
};
export const saveProgress = async (
  videoId: string,
  positionSeconds: number,
  durationSeconds: number,
  observedAt?: string,
): Promise<ProgressRecord | null> =>
  (await request(() =>
    apiClient.put<ProgressRecord | null | ''>(`/me/progress/${encodeURIComponent(videoId)}`, {
      positionSeconds,
      durationSeconds,
      observedAt,
    }),
  )) || null;
export const removeProgress = async (videoId: string): Promise<void> => {
  await request(() => apiClient.delete(`/me/progress/${encodeURIComponent(videoId)}`));
};
export const clearProgress = async (): Promise<void> => {
  await request(() => apiClient.delete('/me/progress'));
};
