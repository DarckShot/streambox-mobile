import { ApiError, apiClient, toApiError } from './client';
import type { Video } from '../types/video';
import { API_BASE_URL } from '../config/apiConfig';

interface ServerVideo {
  id: string;
  externalId: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  duration: number;
  category: string | null;
  author: string | null;
  sourceUrl: string;
  createdAt: string;
  updatedAt: string;
  lastSyncedAt: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const request = async <T>(operation: () => Promise<{ data: T }>): Promise<T> => {
  try {
    const response = await operation();
    return response.data;
  } catch (error: unknown) {
    const normalized = toApiError(error);
    if (normalized.kind !== 'cancelled')
      console.warn('Ошибка видео API:', normalized.kind, normalized.status ?? 'network');
    throw normalized;
  }
};

const parseServerVideo = (value: unknown): ServerVideo => {
  if (
    !isRecord(value) ||
    typeof value.id !== 'string' ||
    !value.id ||
    typeof value.externalId !== 'string' ||
    !value.externalId ||
    typeof value.title !== 'string' ||
    !value.title ||
    typeof value.duration !== 'number' ||
    !Number.isFinite(value.duration) ||
    value.duration < 0 ||
    typeof value.sourceUrl !== 'string' ||
    typeof value.createdAt !== 'string' ||
    typeof value.updatedAt !== 'string' ||
    typeof value.lastSyncedAt !== 'string'
  ) {
    throw new ApiError('invalid-response', 'Сервер вернул некорректные данные видео.');
  }
  return {
    id: value.id,
    externalId: value.externalId,
    title: value.title,
    duration: value.duration,
    sourceUrl: value.sourceUrl,
    description: typeof value.description === 'string' ? value.description : null,
    thumbnailUrl: typeof value.thumbnailUrl === 'string' ? value.thumbnailUrl : null,
    category: typeof value.category === 'string' ? value.category : null,
    author: typeof value.author === 'string' ? value.author : null,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
    lastSyncedAt: value.lastSyncedAt,
  };
};

const formatDuration = (seconds: number): string => {
  const whole = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(whole / 3600);
  const minutes = Math.floor((whole % 3600) / 60);
  const rest = whole % 60;
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`
    : `${minutes}:${String(rest).padStart(2, '0')}`;
};

const toVideo = (value: unknown): Video => {
  const video = parseServerVideo(value);
  return {
    id: video.id,
    externalId: video.externalId,
    url: video.sourceUrl,
    title: video.title,
    description: video.description ?? '',
    thumbnailUrl: video.thumbnailUrl
      ? `${API_BASE_URL}/videos/${encodeURIComponent(video.id)}/thumbnail`
      : '',
    category: video.category ?? 'Без категории',
    author: video.author,
    duration: formatDuration(video.duration),
    durationSeconds: video.duration,
    createdAt: video.createdAt,
    updatedAt: video.updatedAt,
    lastSyncedAt: video.lastSyncedAt,
  };
};

export const getVideos = async (search?: string, signal?: AbortSignal): Promise<Video[]> => {
  const data = await request(() =>
    apiClient.get<unknown>('/videos', {
      params: search ? { search } : undefined,
      signal,
    }),
  );
  if (!Array.isArray(data))
    throw new ApiError('invalid-response', 'Сервер вернул некорректный каталог.');
  return data.map(toVideo);
};

export const getVideo = async (id: string, signal?: AbortSignal): Promise<Video> => {
  const data = await request(() =>
    apiClient.get<unknown>(`/videos/${encodeURIComponent(id)}`, { signal }),
  );
  return toVideo(data);
};

export const importVideo = async (input: string): Promise<Video> => {
  const data = await request(() => apiClient.post<unknown>('/videos/import', { input }));
  return toVideo(data);
};

export const syncVideo = async (id: string): Promise<Video> => {
  const data = await request(() =>
    apiClient.post<unknown>(`/videos/${encodeURIComponent(id)}/sync`),
  );
  return toVideo(data);
};

export const getVideoPlaybackUrl = async (id: string, signal?: AbortSignal): Promise<string> => {
  const data = await request(() =>
    apiClient.get<unknown>(`/videos/${encodeURIComponent(id)}/playback`, {
      signal,
    }),
  );
  if (!isRecord(data) || typeof data.url !== 'string' || !data.url.startsWith('https://')) {
    throw new ApiError('invalid-response', 'Сервер вернул некорректную ссылку на видео.');
  }
  return data.url;
};
