import { createAsyncStorage } from '@react-native-async-storage/async-storage';

import { isValidVideoId } from '../utils/isValidVideoId';

export interface WatchHistoryEntry {
  videoId: string;
  lastWatchedAt: number;
  position: number;
  duration: number;
}

const storage = createAsyncStorage('streamboxWatchHistory');
const STORAGE_KEY = 'entries';
let pendingWrite: Promise<void> = Promise.resolve();

const isEntry = (value: unknown): value is WatchHistoryEntry => {
  if (typeof value !== 'object' || value === null) return false;
  const entry = value as Partial<WatchHistoryEntry>;
  return (
    isValidVideoId(entry.videoId) &&
    typeof entry.lastWatchedAt === 'number' &&
    Number.isFinite(entry.lastWatchedAt) &&
    entry.lastWatchedAt > 0 &&
    typeof entry.position === 'number' &&
    Number.isFinite(entry.position) &&
    entry.position >= 0 &&
    typeof entry.duration === 'number' &&
    Number.isFinite(entry.duration) &&
    entry.duration >= 0
  );
};

export const loadWatchHistory = async (): Promise<WatchHistoryEntry[]> => {
  await pendingWrite.catch(() => undefined);
  const raw = await storage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const unique = new Map<string, WatchHistoryEntry>();
    parsed.filter(isEntry).forEach((entry) => {
      if (
        !unique.has(entry.videoId) ||
        unique.get(entry.videoId)!.lastWatchedAt < entry.lastWatchedAt
      ) {
        unique.set(entry.videoId, entry);
      }
    });
    return [...unique.values()].sort((a, b) => b.lastWatchedAt - a.lastWatchedAt);
  } catch {
    return [];
  }
};

export const saveWatchHistory = (entries: WatchHistoryEntry[]): Promise<void> => {
  const next = pendingWrite
    .catch(() => undefined)
    .then(() =>
      entries.length === 0
        ? storage.removeItem(STORAGE_KEY)
        : storage.setItem(STORAGE_KEY, JSON.stringify(entries)),
    );
  pendingWrite = next;
  return next;
};
