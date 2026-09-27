import { create } from 'zustand';

import { clearAllVideoProgress, loadAllVideoProgress } from '../storage/videoProgress';
import { isValidVideoId } from '../utils/isValidVideoId';

interface SavedProgressState {
  loaded: boolean;
  positions: Record<string, number>;
  resetVersion: number;
  loadProgress: () => Promise<void>;
  setPosition: (videoId: string, position: number | null) => void;
  clearProgress: () => Promise<void>;
}

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
    loading = loadAllVideoProgress()
      .then((loaded) => {
        const positions = clearedDuringLoad ? {} : { ...loaded };
        if (revision !== startedAtRevision) {
          for (const id of changedIds) {
            const current = get().positions[id];
            if (current === undefined) delete positions[id];
            else positions[id] = current;
          }
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
    if (!isValidVideoId(videoId)) return;
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
    await clearAllVideoProgress();
  },
}));
