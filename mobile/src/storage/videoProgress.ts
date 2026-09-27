import { createAsyncStorage } from '@react-native-async-storage/async-storage';

const storage = createAsyncStorage('streamboxPlaybackProgress');
const pendingWrites = new Map<string, Promise<void>>();

const keyForVideo = (videoId: string): string => `video:${encodeURIComponent(videoId)}`;

export const loadAllVideoProgress = async (): Promise<Record<string, number>> => {
  const keys = (await storage.getAllKeys()).filter((key) => key.startsWith('video:'));
  const entries = await Promise.all(
    keys.map(async (key) => {
      try {
        const videoId = decodeURIComponent(key.slice('video:'.length));
        return [videoId, await loadVideoProgress(videoId)] as const;
      } catch {
        return null;
      }
    }),
  );
  const positions: Record<string, number> = {};
  for (const entry of entries) {
    if (entry && entry[1] !== null) positions[entry[0]] = entry[1];
  }
  return positions;
};

export const clearAllVideoProgress = async (): Promise<void> => {
  const keys = (await storage.getAllKeys()).filter((key) => key.startsWith('video:'));
  await Promise.all(
    keys.map(async (key) => {
      let videoId: string;
      try {
        videoId = decodeURIComponent(key.slice('video:'.length));
      } catch {
        await storage.removeItem(key);
        return;
      }
      await clearVideoProgress(videoId);
    }),
  );
};

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
