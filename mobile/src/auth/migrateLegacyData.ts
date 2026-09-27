import { addFavorite, getProgress, recordWatch, saveProgress } from '../api/me';
import { ApiError } from '../api/client';
import { loadFavoriteIds, saveFavoriteIds } from '../storage/favorites';
import { clearVideoProgress, loadAllVideoProgress } from '../storage/videoProgress';
import { loadWatchHistory, saveWatchHistory } from '../storage/watchHistory';
import { getSessionGeneration } from './session';

let pending: Promise<void> | null = null;

const validDate = (timestamp: number): string | undefined => {
  const date = new Date(timestamp);
  return Number.isFinite(date.getTime()) && date.getTime() <= Date.now() + 60_000
    ? date.toISOString()
    : undefined;
};

const isInvalidLegacyEntry = (error: unknown): boolean =>
  error instanceof ApiError && (error.kind === 'not-found' || error.kind === 'invalid-request');

const migrate = async (expectedGeneration: number): Promise<void> => {
  const assertSession = (): void => {
    if (getSessionGeneration() !== expectedGeneration)
      throw new Error('Сессия изменилась во время миграции.');
  };
  const [favoriteIds, history, positions] = await Promise.all([
    loadFavoriteIds(),
    loadWatchHistory(),
    loadAllVideoProgress(),
  ]);
  if (favoriteIds.length === 0 && history.length === 0 && Object.keys(positions).length === 0)
    return;

  assertSession();
  const remainingFavorites = [...favoriteIds];
  for (const videoId of favoriteIds) {
    assertSession();
    try {
      await addFavorite(videoId);
    } catch (error: unknown) {
      if (!isInvalidLegacyEntry(error)) throw error;
    }
    assertSession();
    remainingFavorites.splice(remainingFavorites.indexOf(videoId), 1);
    await saveFavoriteIds(remainingFavorites);
  }
  const remainingHistory = [...history];
  for (const entry of history) {
    assertSession();
    try {
      await recordWatch(entry.videoId, validDate(entry.lastWatchedAt), entry.position === 0);
    } catch (error: unknown) {
      if (!isInvalidLegacyEntry(error)) throw error;
    }
    assertSession();
    remainingHistory.splice(
      remainingHistory.findIndex((item) => item.videoId === entry.videoId),
      1,
    );
    await saveWatchHistory(remainingHistory);
  }
  const serverProgress = Object.keys(positions).length > 0 ? await getProgress() : [];
  for (const [videoId, position] of Object.entries(positions)) {
    assertSession();
    const historical = history.find((entry) => entry.videoId === videoId);
    const existing = serverProgress.find((entry) => entry.videoId === videoId);
    const observedAt = historical ? validDate(historical.lastWatchedAt) : undefined;
    if (
      !existing ||
      (observedAt && Date.parse(existing.updatedAt) < Date.parse(observedAt)) ||
      (!observedAt && existing.positionSeconds < position)
    ) {
      try {
        await saveProgress(videoId, position, historical?.duration ?? 0, observedAt);
      } catch (error: unknown) {
        if (!isInvalidLegacyEntry(error)) throw error;
      }
    }
    assertSession();
    await clearVideoProgress(videoId);
  }
};

export const migrateLegacyData = (): Promise<void> => {
  if (!pending)
    pending = migrate(getSessionGeneration()).finally(() => {
      pending = null;
    });
  return pending;
};
