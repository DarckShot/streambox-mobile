import { createAsyncStorage } from '@react-native-async-storage/async-storage';

const storage = createAsyncStorage('streamboxPlaybackProgress');
const pendingWrites = new Map<string, Promise<void>>();

const keyForVideo = (videoId: string): string => `video:${encodeURIComponent(videoId)}`;

const enqueueWrite = (videoId: string, operation: () => Promise<void>): Promise<void> => {
  const previous = pendingWrites.get(videoId) ?? Promise.resolve();
  const next = previous.catch(() => undefined).then(operation);
  pendingWrites.set(videoId, next);

  next
    .finally(() => {
      if (pendingWrites.get(videoId) === next) {
        pendingWrites.delete(videoId);
      }
    })
    .catch(() => undefined);

  return next;
};

export const loadVideoProgress = async (videoId: string): Promise<number | null> => {
  await pendingWrites.get(videoId)?.catch(() => undefined);
  const raw = await storage.getItem(keyForVideo(videoId));

  if (raw === null) {
    return null;
  }

  const position = Number(raw);
  return Number.isFinite(position) && position > 0 ? position : null;
};

export const saveVideoProgress = (videoId: string, position: number): Promise<void> => {
  if (!Number.isFinite(position) || position < 0) {
    return Promise.resolve();
  }

  return enqueueWrite(videoId, () =>
    position === 0
      ? storage.removeItem(keyForVideo(videoId))
      : storage.setItem(keyForVideo(videoId), String(position)),
  );
};

export const clearVideoProgress = (videoId: string): Promise<void> =>
  enqueueWrite(videoId, () => storage.removeItem(keyForVideo(videoId)));
