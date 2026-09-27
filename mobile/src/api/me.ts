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
    throw toApiError(error);
  }
};
const list = <T>(value: unknown): T[] => {
  if (!Array.isArray(value))
    throw new ApiError('invalid-response', 'Сервер вернул неверные пользовательские данные.');
  return value as T[];
};

export const getCurrentUser = async (): Promise<CurrentUser> => {
  const data = await request(() => apiClient.get<unknown>('/users/me'));
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
export const getFavorites = async (): Promise<FavoriteRecord[]> =>
  list(await request(() => apiClient.get<unknown>('/me/favorites')));
export const addFavorite = async (videoId: string): Promise<FavoriteRecord> =>
  request(() => apiClient.post<FavoriteRecord>(`/me/favorites/${encodeURIComponent(videoId)}`));
export const removeFavorite = async (videoId: string): Promise<void> => {
  await request(() => apiClient.delete(`/me/favorites/${encodeURIComponent(videoId)}`));
};
export const clearFavorites = async (): Promise<void> => {
  await request(() => apiClient.delete('/me/favorites'));
};

export const getHistory = async (): Promise<HistoryRecord[]> =>
  list(await request(() => apiClient.get<unknown>('/me/history')));
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

export const getProgress = async (): Promise<ProgressRecord[]> =>
  list(await request(() => apiClient.get<unknown>('/me/progress')));
export const getVideoProgress = async (videoId: string): Promise<ProgressRecord | null> =>
  (await request(() =>
    apiClient.get<ProgressRecord | null | ''>(`/me/progress/${encodeURIComponent(videoId)}`),
  )) || null;
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
