import { create } from 'zustand';

import { VIDEO_CATALOG } from '../constants/videoCatalog';
import { clearVideoProgress, loadVideoProgress } from '../storage/videoProgress';

interface SavedProgressState {
  loaded: boolean;
  positions: Record<string, number>;
  resetVersion: number;
  loadProgress: () => Promise<void>;
  setPosition: (videoId: string, position: number | null) => void;
  clearProgress: () => Promise<void>;
}

const videoIds = VIDEO_CATALOG.map(({ id }) => id);
const knownIds = new Set(videoIds);
let loading: Promise<void> | null = null;
let revision = 0;
const changedIds = new Set<string>();
let clearedDuringLoad = false;

export const useSavedProgressStore = create<SavedProgressState>()((set, get) => ({
  loaded: false,
  positions: {},
  resetVersion: 0,
  loadProgress: (): Promise<void> => {
    if (get().loaded) return Promise.resolve();
    if (loading) return loading;
    const startedAtRevision = revision;
    loading = Promise.all(videoIds.map(async (id) => [id, await loadVideoProgress(id)] as const))
      .then((results) => {
        const positions: Record<string, number> = clearedDuringLoad ? {} : { ...get().positions };
        for (const [id, position] of results) {
          if (revision !== startedAtRevision && changedIds.has(id)) continue;
          if (position !== null && !clearedDuringLoad) positions[id] = position;
        }
        changedIds.clear();
        clearedDuringLoad = false;
        set({ positions, loaded: true });
      })
      .catch((error: unknown) => {
        console.warn('Не удалось загрузить прогресс просмотра.', error);
        set({ loaded: true });
      })
      .finally(() => {
        loading = null;
      });
    return loading;
  },
  setPosition: (videoId, position): void => {
    if (!knownIds.has(videoId)) return;
    revision += 1;
    if (!get().loaded) changedIds.add(videoId);
    const positions = { ...get().positions };
    if (position !== null && Number.isFinite(position) && position > 0)
      positions[videoId] = position;
    else delete positions[videoId];
    set({ positions });
  },
  clearProgress: async (): Promise<void> => {
    revision += 1;
    clearedDuringLoad = true;
    changedIds.clear();
    set({ positions: {}, loaded: true, resetVersion: get().resetVersion + 1 });
    await Promise.all(videoIds.map(clearVideoProgress));
  },
}));
