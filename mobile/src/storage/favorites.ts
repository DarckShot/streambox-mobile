import { createAsyncStorage } from '@react-native-async-storage/async-storage';

import { VIDEO_CATALOG } from '../constants/videoCatalog';

const storage = createAsyncStorage('streamboxFavorites');
const FAVORITE_VIDEO_IDS_KEY = 'videoIds';
const knownVideoIds = new Set(VIDEO_CATALOG.map((video) => video.id));

export const normalizeFavoriteIds = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(value.filter((id): id is string => typeof id === 'string' && knownVideoIds.has(id))),
  );
};

export const isKnownVideoId = (videoId: string): boolean => knownVideoIds.has(videoId);

export const loadFavoriteIds = async (): Promise<string[]> => {
  const raw = await storage.getItem(FAVORITE_VIDEO_IDS_KEY);

  if (raw === null) {
    return [];
  }

  try {
    return normalizeFavoriteIds(JSON.parse(raw));
  } catch {
    return [];
  }
};

export const saveFavoriteIds = (videoIds: string[]): Promise<void> =>
  storage.setItem(FAVORITE_VIDEO_IDS_KEY, JSON.stringify(normalizeFavoriteIds(videoIds)));
